import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (process.env.NODE_ENV === "production") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(`${origin}`);
    }
  }

  NextResponse.next();
}
