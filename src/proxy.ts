import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Email allowlist ──────────────────────────────────────────────────────────
const ALLOWED_EMAILS = new Set([
  "frumarkcarrington@gmail.com",
  "melvisfri@gmail.com",
]);
const ALLOWED_DOMAINS = new Set(["melsplaceonline.com"]);

function isEmailAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (ALLOWED_EMAILS.has(lower)) return true;
  const domain = lower.split("@")[1];
  return domain ? ALLOWED_DOMAINS.has(domain) : false;
}

// ─── Route matchers ────────────────────────────────────────────────────────────
// Only /dashboard/** is the admin area — /admin-login is the public sign-in page
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedStoreRoute = createRouteMatcher([
  "/cart(.*)",
  "/orders(.*)",
  "/settings(.*)",
  "/wishlist(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // ── Email allowlist gate ────────────────────────────────────────────────────
  // If a user is signed in, verify their email is on the allowlist.
  // We store the email in public metadata (set by the webhook on user.created).
  // Session claims carry public metadata, so no extra API call is needed.
  if (userId) {
    const meta = sessionClaims?.metadata as
      | { role?: string; email?: string }
      | undefined;
    const email =
      meta?.email ??
      ((sessionClaims as Record<string, unknown>)?.email as string | undefined);

    // If email isn't in session claims yet (first sign-in), fall through and
    // let the webhook handle cleanup.  If it IS present and not allowed, kick them out.
    if (email && !isEmailAllowed(email)) {
      const signOutUrl = new URL("/sign-in?error=unauthorized", req.url);
      return NextResponse.redirect(signOutUrl);
    }
  }

  // ── Protected store routes ──────────────────────────────────────────────────
  if (isProtectedStoreRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── Admin dashboard routes ──────────────────────────────────────────────────
  if (isDashboardRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }

    const jwtRole = (sessionClaims?.metadata as { role?: string })?.role;

    // Fast path: JWT already has the role
    if (jwtRole === "admin") {
      return NextResponse.next();
    }

    // JWT may be stale (e.g. first sign-in, webhook just fired) — check Clerk API
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      const freshUser = await clerk.users.getUser(userId);
      const freshRole = (freshUser.publicMetadata as { role?: string })?.role;

      if (freshRole === "admin") return NextResponse.next();

      // Role not in metadata yet — webhook may still be in-flight on first sign-up.
      // Fall back to email allowlist so a legitimate admin isn't blocked.
      const primaryEmail = freshUser.emailAddresses.find(
        (e) => e.id === freshUser.primaryEmailAddressId
      )?.emailAddress;
      if (isEmailAllowed(primaryEmail)) return NextResponse.next();

      return NextResponse.redirect(new URL("/products", req.url));
    } catch {
      // Can't verify — deny access
      return NextResponse.redirect(new URL("/products", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
