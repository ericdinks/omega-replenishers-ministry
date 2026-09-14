import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protects every /admin route except /admin/login behind a valid Supabase
 * Auth session belonging to an actual `admin` profile -- teacher/student
 * accounts (Training Portal) are real sessions too, and must never see
 * this dashboard. Also refreshes the session cookie on each request so
 * long-lived admin sessions don't silently expire mid-visit.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!session && !isLoginRoute) {
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";

    if (!isAdmin && !isLoginRoute) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    if (isAdmin && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
