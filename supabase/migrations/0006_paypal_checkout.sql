-- ===========================================================================
-- Omega Replenishers International Ministry
-- Real PayPal Checkout integration for /store: tracks the PayPal order id
-- against our own order row so a capture can never be processed twice,
-- and so completed payments can be told apart from abandoned ones.
-- ===========================================================================

alter table public.product_orders
  add column if not exists paypal_order_id text unique;

comment on column public.product_orders.paypal_order_id is
  'The PayPal Checkout order id, set once payment is captured server-side. Unique so a capture can never be double-processed.';
