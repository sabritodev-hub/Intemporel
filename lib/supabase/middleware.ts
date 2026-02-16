import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  console.log("🛡️ [Middleware] Chemin demandé:", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log(
    "🛡️ [Middleware] Utilisateur connecté:",
    user?.email || "NON CONNECTÉ",
  );
  if (error) {
    console.log("🛡️ [Middleware] Erreur auth:", error.message);
  }

  // Protected routes - admin
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    if (!user) {
      console.log("🛡️ [Middleware] ❌ Accès refusé - Redirection vers login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    console.log("🛡️ [Middleware] ✅ Accès autorisé pour", user.email);
  }

  // Redirect logged in users away from login page
  if (request.nextUrl.pathname === "/admin/login" && user) {
    console.log(
      "🛡️ [Middleware] Utilisateur déjà connecté - Redirection vers dashboard",
    );
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}
