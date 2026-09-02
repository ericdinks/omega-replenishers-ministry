"use server";

import { productOrderSchema, type ProductOrderFormState, type ProductOrderInput } from "@/lib/validation/order";
import { sanitizeEmail, sanitizeText } from "@/lib/utils/sanitize";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Records a pending purchase intent and returns its id, which the client
 * uses to correlate the PayPal Checkout flow (create order -> approve ->
 * capture, see /api/paypal/*) back to this row. The price is always
 * re-read from the database here -- never trusted from the client -- so
 * nothing lets a visitor pay less than the real listed price. Nothing is
 * fulfilled or emailed at this point; that only happens once PayPal
 * confirms the payment actually captured.
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
    .select("id, price")
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

  // Uses the admin client solely to read back the generated id (RETURNING
  // a row requires SELECT, and the public/anon role intentionally has no
  // SELECT policy on product_orders -- customers must never be able to
  // list each other's orders). Input above is already fully validated,
  // sanitized, and price-verified before reaching here.
  const admin = createSupabaseAdminClient();
  const { data: inserted, error: insertError } = await admin
    .from("product_orders")
    .insert(sanitized)
    .select("id")
    .single();

  if (insertError || !inserted) {
    return {
      status: "error",
      message: "We couldn't start your order right now. Please try again shortly.",
    };
  }

  return {
    status: "success",
    orderId: inserted.id,
  };
}
