import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { capturePaypalOrder } from "@/lib/paypal/api";
import { sendNotificationEmail } from "@/lib/email/resend";
import { getSiteContent } from "@/lib/content/site-content";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
const AMOUNT_TOLERANCE = 0.01;

/**
 * The single source of truth for "did this order actually get paid."
 * Captures the PayPal order server-side, verifies the captured amount
 * matches what the product actually costs, and only then marks the order
 * fulfilled, generates a signed download link, and emails it. Idempotent:
 * safe to call more than once for the same order.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { paypalOrderId, orderId } = body as { paypalOrderId?: unknown; orderId?: unknown };
  if (typeof paypalOrderId !== "string" || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing paypalOrderId or orderId." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: order, error: orderError } = await admin
    .from("product_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    if (orderError) console.error("capture-order: failed to load order:", orderError);
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotency: if this exact PayPal order was already captured and
  // fulfilled, just hand back a fresh download link instead of erroring
  // or re-sending the email.
  if (order.paypal_order_id === paypalOrderId && order.status === "fulfilled") {
    const { data: product } = await admin
      .from("products")
      .select("file_path, title")
      .eq("id", order.product_id)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const { data: signed } = await admin.storage
      .from("digital-products")
      .createSignedUrl(product.file_path, SEVEN_DAYS_IN_SECONDS);

    return NextResponse.json({ downloadUrl: signed?.signedUrl, productTitle: product.title });
  }

  if (order.paypal_order_id && order.paypal_order_id !== paypalOrderId) {
    return NextResponse.json({ error: "This order was already processed." }, { status: 409 });
  }

  let capture;
  try {
    capture = await capturePaypalOrder(paypalOrderId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to capture PayPal payment." },
      { status: 502 }
    );
  }

  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment was not completed." }, { status: 402 });
  }

  if (
    capture.capturedAmount === null ||
    Math.abs(capture.capturedAmount - order.amount) > AMOUNT_TOLERANCE
  ) {
    return NextResponse.json({ error: "Captured amount did not match the order." }, { status: 400 });
  }

  const { data: product, error: productError } = await admin
    .from("products")
    .select("file_path, title")
    .eq("id", order.product_id)
    .maybeSingle();

  if (productError || !product) {
    if (productError) console.error("capture-order: failed to load product:", productError);
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("product_orders")
    .update({ status: "fulfilled", paypal_order_id: paypalOrderId })
    .eq("id", orderId);

  if (updateError) {
    console.error("capture-order: failed to mark order fulfilled:", updateError);
    return NextResponse.json(
      { error: `Failed to record the fulfilled order: ${updateError.message}` },
      { status: 500 }
    );
  }

  const { data: signed, error: signError } = await admin.storage
    .from("digital-products")
    .createSignedUrl(product.file_path, SEVEN_DAYS_IN_SECONDS);

  if (signError || !signed) {
    console.error("capture-order: failed to create signed url:", signError);
    return NextResponse.json({ error: "Payment succeeded but the download link failed to generate. Contact the ministry office." }, { status: 500 });
  }

  const downloadUrl = signed.signedUrl;

  // Best-effort emails -- never block the customer's on-screen download
  // link on these. Note: emailing the CUSTOMER only actually lands until
  // a custom domain is verified with Resend; until then this silently
  // no-ops for any address other than the Resend account's own.
  await sendNotificationEmail({
    to: order.customer_email,
    subject: `Your purchase: ${product.title}`,
    text: [
      `Hi ${order.customer_name},`,
      ``,
      `Thank you for your purchase! Here is your download link (valid for 7 days):`,
      downloadUrl,
      ``,
      `God bless you.`,
    ].join("\n"),
  });

  const content = await getSiteContent();
  await sendNotificationEmail({
    to: content.order_notification_email,
    subject: `Paid: ${product.title}`,
    text: [
      `A payment was just completed and fulfilled automatically on /store.`,
      ``,
      `Product: ${product.title}`,
      `Amount: ${capture.capturedAmount} ${capture.capturedCurrency ?? ""}`,
      `Customer: ${order.customer_name} <${order.customer_email}>`,
    ].join("\n"),
  });

  return NextResponse.json({ downloadUrl, productTitle: product.title });
}
