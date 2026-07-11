import { auth } from "./auth";
import { NextResponse } from "next/server";

/**
 * Protege as rotas /admin (somente ADMIN) e /carrinho (somente usuário logado).
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isCartRoute = nextUrl.pathname.startsWith("/carrinho");

  if (isAdminRoute) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  if (isCartRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/carrinho/:path*"]
};
