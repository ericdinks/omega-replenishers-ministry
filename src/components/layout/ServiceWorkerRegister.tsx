"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker (public/sw.js) so the site is
 * installable and usable offline. Renders nothing -- purely a side effect.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: the site still works fully online without it.
      });
    }
  }, []);

  return null;
}
