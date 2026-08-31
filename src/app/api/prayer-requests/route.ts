import { NextResponse } from "next/server";
import { submitPrayerRequest } from "@/app/prayer-altar/actions";

/**
 * REST entry point for submitting a prayer request, sharing the exact
 * same validation, sanitization, and Supabase insert logic as the Prayer
 * Altar page's Server Action. Kept alongside the Server Action so future
 * clients (a mobile app, a partner integration) have a stable JSON API
 * without duplicating business logic.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ status: "error", message: "Invalid request body." }, { status: 400 });
  }

  const { fullName, email, request: prayerRequest, isPublic } = body as Record<string, unknown>;

  const result = await submitPrayerRequest({
    fullName: typeof fullName === "string" ? fullName : "",
    email: typeof email === "string" ? email : "",
    request: typeof prayerRequest === "string" ? prayerRequest : "",
    isPublic: Boolean(isPublic),
  });

  return NextResponse.json(result, {
    status: result.status === "success" ? 201 : 400,
  });
}
