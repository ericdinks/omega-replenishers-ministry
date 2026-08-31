import { z } from "zod";

export const productOrderSchema = z.object({
  productId: z.string().uuid("Invalid product."),
  customerName: z
    .string()
    .min(2, "Please share your full name.")
    .max(200, "Name is too long."),
  customerEmail: z
    .string()
    .min(3, "Please share a valid email address.")
    .max(320, "Email is too long.")
    .email("Please enter a valid email address."),
});

export type ProductOrderInput = z.infer<typeof productOrderSchema>;

export interface ProductOrderFormState {
  status: "idle" | "success" | "error";
  message?: string;
  paypalUrl?: string;
  fieldErrors?: Partial<Record<keyof ProductOrderInput, string>>;
}
