import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const referralToken =
      request.nextUrl.searchParams.get("ref")?.trim();

    if (!referralToken) {
      return NextResponse.json(
        { error: "VIP referral token is required." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { referralToken },
      include: {
        welcomeReward: true,
        referralReceived: {
          include: {
            referrer: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "VIP member could not be found." },
        { status: 404 }
      );
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");

    const referralUrl =
      `${appUrl}/vip/register?ref=${encodeURIComponent(referralToken)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(referralUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      success: true,
      vehiclePlate: customer.vehiclePlate,
      vipCode: customer.vipCode,
      inviterVehiclePlate:
        customer.referralReceived?.referrer.vehiclePlate ?? null,
      isInitialMember: !customer.referralReceived,
      reward: "1× Free Nano Wax Treatment",
      rewardStatus: customer.welcomeReward?.status ?? "UNAVAILABLE",
      referralUrl,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error("VIP card retrieval error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve VIP card. Please try again." },
      { status: 500 }
    );
  }
}
