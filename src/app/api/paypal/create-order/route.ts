import { NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createPaypalOrder } from "@/lib/paypal/api";
import { paypalConfig } from "@/lib/config/site";

/**
 * Creates a PayPal order for a product, using the price read fresh from
 * the database -- never trusting a client-supplied amount.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productId = (body as { productId?: unknown })?.productId;
  if (typeof productId !== "string") {
    return NextResponse.json({ error: "Missing productId." }, { status: 400 });
  }

  const supabase = createSupabasePublicClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("price")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    const paypalOrderId = await createPaypalOrder(product.price, paypalConfig.currency);
    return NextResponse.json({ paypalOrderId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create PayPal order." },
      { status: 502 }
    );
  }
}
