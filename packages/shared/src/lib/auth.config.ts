import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

// Each zone (storefront vs admin) sets its own AUTH_COOKIE_PREFIX so the two
// apps get distinct session cookies — logging into the admin panel must not
// also authenticate the storefront, and vice versa, even though both zones
// share this same auth config and run on the same domain.
const cookiePrefix = process.env.AUTH_COOKIE_PREFIX ?? "authjs";

// Edge-safe config shared by middleware and the full auth.ts. Must not import
// the database layer (or anything Node-only) — middleware runs on the edge runtime and
// only needs to decode the session JWT, not hit the database.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  cookies: {
    sessionToken: { name: `${cookiePrefix}.session-token` },
    callbackUrl: { name: `${cookiePrefix}.callback-url` },
    csrfToken: { name: `${cookiePrefix}.csrf-token` },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = isLoggedIn && auth?.user.role === "ADMIN";
      const { pathname } = request.nextUrl;

      // The admin panel has its own login page, entirely separate from the
      // storefront's — never bounce a failed /bunnycraft-admin check to /login.
      if (pathname.startsWith("/bunnycraft-admin")) {
        if (pathname === "/bunnycraft-admin/login") {
          return isAdmin ? NextResponse.redirect(new URL("/bunnycraft-admin", request.url)) : true;
        }
        if (isAdmin) return true;
        const loginUrl = new URL("/bunnycraft-admin/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (pathname.startsWith("/account")) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      // useSession().update({ name, image }) on the profile form lands here —
      // without this, a changed name/avatar wouldn't show up until re-login
      // since the JWT strategy has no server-side session to re-read from.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.image === "string" || session.image === null) {
          token.picture = session.image;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [],
};
