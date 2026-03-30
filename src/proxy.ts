import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith("/sign-in");
};

export default function middleware(req: NextRequest) {
  if (!isPublicRoute(req)) {
    const token = req.cookies.get("ctvl_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
