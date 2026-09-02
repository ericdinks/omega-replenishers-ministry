import "server-only";

/**
 * Minimal PayPal Orders v2 REST client (no SDK dependency, consistent
 * with how this project calls YouTube/Resend directly). Used only by the
 * two /api/paypal route handlers -- never imported client-side, since
 * PAYPAL_CLIENT_SECRET must never reach the browser.
 *
 * PAYPAL_MODE controls which PayPal environment is used:
 *   "sandbox" (default) -- fake money, for testing the whole flow safely
 *   "live"              -- real payments into the ministry's real account
 */
function getPaypalApiBase(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPaypalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured (missing client id/secret).");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPaypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

/**
 * Creates a PayPal order for the exact amount looked up server-side (the
 * caller must pass the real, DB-verified price -- never a client-supplied
 * one). Returns the PayPal order id the JS SDK button needs to proceed.
 */
export async function createPaypalOrder(amount: number, currency: string): Promise<string> {
  const accessToken = await getPaypalAccessToken();

  const response = await fetch(`${getPaypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to create the PayPal order.");
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error("PayPal did not return an order id.");
  }

  return data.id;
}

export interface PaypalCaptureResult {
  status: string;
  capturedAmount: number | null;
  capturedCurrency: string | null;
}

/**
 * Captures (finalizes) a previously-created PayPal order. This is the
 * single source of truth for "did the customer actually pay" -- nothing
 * downstream (fulfillment, email) should happen until this returns
 * status "COMPLETED".
 */
export async function capturePaypalOrder(paypalOrderId: string): Promise<PaypalCaptureResult> {
  const accessToken = await getPaypalAccessToken();

  const response = await fetch(
    `${getPaypalApiBase()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as {
    status?: string;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{ amount?: { value?: string; currency_code?: string } }>;
      };
    }>;
  };

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    status: data.status ?? "UNKNOWN",
    capturedAmount: capture?.amount?.value ? Number(capture.amount.value) : null,
    capturedCurrency: capture?.amount?.currency_code ?? null,
  };
}
