import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export async function GET(request: NextRequest) {
  const suppliedToken = request.nextUrl.searchParams.get("token") || "";
  const secret = process.env.VIP_INITIAL_SETUP_TOKEN || "";

  const suppliedBuffer = Buffer.from(suppliedToken);
  const secretBuffer = Buffer.from(secret);

  const valid =
    suppliedBuffer.length > 0 &&
    suppliedBuffer.length === secretBuffer.length &&
    timingSafeEqual(suppliedBuffer, secretBuffer);

  if (!valid) {
    return new NextResponse("Invalid or expired setup link.", {
      status: 403,
    });
  }

  const response = NextResponse.redirect(
    new URL("/vip/register", request.url)
  );

  response.cookies.set("vip-initial-setup", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/vip/register",
    maxAge: 300,
  });

  return response;
}
