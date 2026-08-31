"use server";

import { productOrderSchema, type ProductOrderFormState, type ProductOrderInput } from "@/lib/validation/order";
import { sanitizeEmail, sanitizeText } from "@/lib/utils/sanitize";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { buildPaypalUrl } from "@/lib/utils/paypal";
import { getSiteContent } from "@/lib/content/site-content";
import { sendNotificationEmail } from "@/lib/email/resend";

/**
 * Records a purchase intent and returns the exact PayPal URL to send the
 * customer to. The price is always re-read from the database here --
 * never trusted from the client -- so nothing lets a visitor pay less
 * than the real listed price.
 */
export async function createProductOrder(
  input: ProductOrderInput
): Promise<ProductOrderFormState> {
  const parsed = productOrderSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: ProductOrderFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ProductOrderInput | undefined;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = createSupabasePublicClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, title")
    .eq("id", parsed.data.productId)
    .eq("is_active", true)
    .maybeSingle();

  if (productError || !product) {
    return { status: "error", message: "This product isn't available right now." };
  }

  const sanitized = {
    product_id: product.id,
    customer_name: sanitizeText(parsed.data.customerName),
    customer_email: sanitizeEmail(parsed.data.customerEmail),
    amount: product.price,
  };

  const { error: insertError } = await supabase.from("product_orders").insert(sanitized);

  if (insertError) {
    return {
      status: "error",
      message: "We couldn't start your order right now. Please try again shortly.",
    };
  }

  const paypalUrl = buildPaypalUrl(product.price);
  if (!paypalUrl) {
    return {
      status: "error",
      message: "Giving/checkout isn't configured yet. Please contact the ministry office.",
    };
  }

  const content = await getSiteContent();
  await sendNotificationEmail({
    to: content.order_notification_email,
    subject: `New order: ${product.title}`,
    text: [
      `A new order was just started on /store.`,
      ``,
      `Product: ${product.title}`,
      `Amount: ${product.price}`,
      `Customer: ${sanitized.customer_name} <${sanitized.customer_email}>`,
      ``,
      `Check your PayPal account for the matching payment, then generate and send the download link from the Store tab in /admin.`,
    ].join("\n"),
  });

  return {
    status: "success",
    message: `Redirecting you to PayPal to complete your purchase of "${product.title}".`,
    paypalUrl,
  };
}
