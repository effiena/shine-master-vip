import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const vehiclePlate = String(body.vehiclePlate || "")
      .toUpperCase()
      .replace(/[\s-]/g, "");

    const referralToken = String(body.ref || "").trim();
    const setupCookie = request.cookies.get("vip-initial-setup")?.value;
    const setupSecret = process.env.VIP_INITIAL_SETUP_TOKEN;

    const isInitialSetup =
      Boolean(setupSecret) &&
      Boolean(setupCookie) &&
      setupCookie === setupSecret;

    if (!/^[A-Z0-9]{2,12}$/.test(vehiclePlate)) {
      return NextResponse.json(
        { error: "Please enter a valid vehicle plate number." },
        { status: 400 }
      );
    }

    if (!referralToken && !isInitialSetup) {
      return NextResponse.json(
        { error: "Please register using a valid VIP referral QR code." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const customerCount = await tx.customer.count();

        if (!referralToken) {
          if (!isInitialSetup || customerCount !== 0) {
            throw new Error("INITIAL_SETUP_CLOSED");
          }

          const customer = await tx.customer.create({
            data: {
              vehiclePlate,
              vipCode: vehiclePlate,
            },
          });

          await tx.welcomeReward.create({
            data: {
              customerId: customer.id,
              status: "AVAILABLE",
            },
          });

          return {
            customerId: customer.id,
            vehiclePlate: customer.vehiclePlate,
            vipCode: customer.vipCode!,
            referralToken: customer.referralToken,
            inviterVehiclePlate: null,
            isInitialMember: true,
          };
        }

        const inviter = await tx.customer.findUnique({
          where: { referralToken },
        });

        if (!inviter) {
          throw new Error("INVALID_REFERRAL");
        }

        if (inviter.vehiclePlate === vehiclePlate) {
          throw new Error("SELF_REFERRAL");
        }

        const existingCustomer = await tx.customer.findUnique({
          where: { vehiclePlate },
        });

        if (existingCustomer) {
          throw new Error("PLATE_ALREADY_REGISTERED");
        }

        const counter = await tx.referralCounter.upsert({
          where: { referrerId: inviter.id },
          create: {
            referrerId: inviter.id,
            nextNumber: 2,
          },
          update: {
            nextNumber: { increment: 1 },
          },
        });

        const sequenceNumber = counter.nextNumber - 1;

        const vipCode =
          `${inviter.vehiclePlate}-${String(sequenceNumber).padStart(3, "0")}`;

        const customer = await tx.customer.create({
          data: {
            vehiclePlate,
            vipCode,
          },
        });

        await tx.referral.create({
          data: {
            referralCode: vipCode,
            referrerId: inviter.id,
            referredCustomerId: customer.id,
            sequenceNumber,
          },
        });

        await tx.welcomeReward.create({
          data: {
            customerId: customer.id,
            status: "AVAILABLE",
          },
        });

        return {
          customerId: customer.id,
          vehiclePlate: customer.vehiclePlate,
          vipCode,
          referralToken: customer.referralToken,
          inviterVehiclePlate: inviter.vehiclePlate,
          isInitialMember: false,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ).replace(/\/$/, "");

    const referralUrl =
      `${appUrl}/vip/register?ref=${encodeURIComponent(result.referralToken)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(referralUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const response = NextResponse.json({
      success: true,
      customerId: result.customerId,
      vehiclePlate: result.vehiclePlate,
      vipCode: result.vipCode,
      inviterVehiclePlate: result.inviterVehiclePlate,
      isInitialMember: result.isInitialMember,
      reward: "1× Free Nano Wax Treatment",
      rewardStatus: "AVAILABLE",
      referralUrl,
      qrCodeDataUrl,
      redirectUrl: "/vip/welcome",
    });

    if (result.isInitialMember) {
      response.cookies.set("vip-initial-setup", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/vip/register",
        maxAge: 0,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, string> = {
        INVALID_REFERRAL: "This VIP referral link is invalid.",
        SELF_REFERRAL: "You cannot refer your own vehicle.",
        PLATE_ALREADY_REGISTERED: "This vehicle plate is already registered.",
        INITIAL_SETUP_CLOSED:
          "The first VIP registration has already been completed. Please use a referral QR code.",
      };

      if (messages[error.message]) {
        return NextResponse.json(
          { error: messages[error.message] },
          { status: 400 }
        );
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This vehicle plate or VIP code is already registered." },
        { status: 409 }
      );
    }

    console.error("VIP registration error:", error);

    return NextResponse.json(
      { error: "Registration could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
