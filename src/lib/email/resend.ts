import "server-only";

/**
 * Sends an email via Resend's REST API (no SDK dependency -- consistent
 * with how this project calls YouTube's API directly). Uses Resend's
 * shared `onboarding@resend.dev` sender, which works without verifying a
 * custom domain -- fine for internal notifications to the ministry's own
 * inbox. Once a real domain is set up, verify it in Resend and swap the
 * `from` address for a branded one.
 *
 * Returns silently (does not throw) on failure or when RESEND_API_KEY is
 * unset, since a notification email is a nice-to-have, not something
 * that should ever block a customer's order from being recorded.
 */
export async function sendNotificationEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Omega Replenishers Store <onboarding@resend.dev>",
        to: [options.to],
        subject: options.subject,
        text: options.text,
      }),
    });
  } catch {
    // Best-effort only -- never let a notification failure affect the caller.
  }
}
