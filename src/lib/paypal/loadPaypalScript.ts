"use client";

declare global {
  interface Window {
    paypal?: unknown;
  }
}

let loadPromise: Promise<void> | null = null;

/**
 * Injects the PayPal JS SDK script tag once per page load (shared across
 * every product card that needs it) and resolves once `window.paypal` is
 * ready to use.
 */
export function loadPaypalScript(clientId: string, currency: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal."));
    document.body.appendChild(script);
  });

  return loadPromise;
}
