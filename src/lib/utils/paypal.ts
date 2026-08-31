import { paypalConfig } from "@/lib/config/site";

/**
 * Builds a safe redirect URL to the ministry's public PayPal.Me profile or
 * hosted "Donate" button link, optionally pre-filling an amount. Never
 * transmits any user-entered data anywhere except as a PayPal URL
 * parameter -- there is no server round trip, so nothing is stored.
 */
export function buildPaypalUrl(amount?: number): string {
  const base = paypalConfig.link;
  if (!base) return "";

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return "";
  }

  // Only ever allow redirects to paypal.com / paypal.me domains, regardless
  // of what an operator misconfigures in the env var.
  const allowedHosts = ["paypal.com", "www.paypal.com", "paypal.me"];
  const isAllowed = allowedHosts.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
  );
  if (!isAllowed) return "";

  if (!amount || amount <= 0) {
    return url.toString();
  }

  if (url.hostname === "paypal.me") {
    const trimmedPath = url.pathname.replace(/\/$/, "");
    return `${url.origin}${trimmedPath}/${amount}${paypalConfig.currency}`;
  }

  url.searchParams.set("amount", amount.toFixed(2));
  url.searchParams.set("currency_code", paypalConfig.currency);
  return url.toString();
}
