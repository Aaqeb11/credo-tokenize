import { auth } from "../auth";

export default auth((req) => {
  const isPublicRoute = req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/api/auth");
  
  if (!req.auth && !isPublicRoute) {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};