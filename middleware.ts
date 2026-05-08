import { clerkMiddleware } from "@clerk/nextjs/server";

// No protected routes yet — Phase A is just wiring auth in.
// Mutations to favorites / collections will be guarded inside their
// route handlers via `await auth()` rather than at the middleware layer.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
