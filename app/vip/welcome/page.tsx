"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type RegistrationResult = {
  vehiclePlate: string;
  vipCode: string;
  inviterVehiclePlate: string | null;
  isInitialMember: boolean;
  reward: string;
  rewardStatus: string;
  referralUrl: string;
  qrCodeDataUrl: string;
};

export default function VIPWelcomePage() {
  const [registration, setRegistration] =
    useState<RegistrationResult | null>(null);

  useEffect(() => {
    const loadRegistration = async () => {
      const saved = sessionStorage.getItem("shineVipRegistration");

      if (saved) {
        try {
          const data = JSON.parse(saved) as RegistrationResult;
          setRegistration(data);
          return;
        } catch {
          sessionStorage.removeItem("shineVipRegistration");
        }
      }

      const token = new URLSearchParams(window.location.search).get("ref");

      if (!token) return;

      try {
        const response = await fetch(
          `/api/vip/card?ref=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("VIP card retrieval failed:", data.error);
          return;
        }

        const registrationData = data as RegistrationResult;

        sessionStorage.setItem(
          "shineVipRegistration",
          JSON.stringify(registrationData)
        );

        setRegistration(registrationData);
      } catch (error) {
        console.error("Unable to load VIP card:", error);
      }
    };

    loadRegistration();
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black px-5 py-12 text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.72)), url('/vip-sports-car.png')",
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-80 w-full rotate-[-20deg] bg-gradient-to-r from-yellow-500/40 via-purple-700/30 to-transparent blur-3xl" />
        <div className="absolute -right-32 top-48 h-80 w-full rotate-[20deg] bg-gradient-to-l from-purple-600/40 via-yellow-500/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 h-64 w-full bg-gradient-to-t from-yellow-600/20 to-transparent blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[90vh] max-w-3xl flex-col items-center justify-center text-center">
        <div className="mb-8">
          <p className="text-3xl font-black italic tracking-wider text-yellow-400 drop-shadow-[0_0_18px_rgba(255,190,0,0.8)]">
            SHINE MASTER
          </p>
          <p className="mt-1 text-xs tracking-[0.7em] text-yellow-200">
            SOLUTION
          </p>
        </div>

        <h1 className="text-5xl font-black italic text-yellow-400 drop-shadow-[0_0_25px_rgba(255,190,0,0.8)] sm:text-7xl">
          WELCOME!
        </h1>

        <h2 className="mt-6 text-2xl font-bold sm:text-4xl">
          Your <span className="text-yellow-400">FREE</span> Nano Wax Gift Awaits
        </h2>

        <p className="mt-5 text-lg italic leading-relaxed text-zinc-200">
          You've been invited by an existing<br />
          VIP Referral Wash member.
        </p>

        <div className="relative mt-12 w-full rounded-3xl border-2 border-yellow-500 bg-black/90 px-5 py-9 shadow-[0_0_35px_rgba(255,190,0,0.4)] sm:px-10">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-yellow-100 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 px-10 py-3 text-2xl font-black italic text-black shadow-[0_0_25px_rgba(255,190,0,0.7)]">
            FREE GIFT
          </div>

          <h3 className="mt-5 text-2xl font-black italic sm:text-4xl">
            <span className="text-yellow-400">1×</span> Free Nano Wax Treatment
          </h3>

          <p className="mt-5 text-base italic leading-relaxed text-zinc-300">
            Your welcome gift is ready to redeem<br />
            at Shine Master Solution.
          </p>

          <div className="mx-auto mt-7 max-w-sm rounded-full border border-yellow-200 bg-gradient-to-r from-yellow-400 to-yellow-200 px-4 py-4 font-black text-black shadow-[0_0_25px_rgba(255,190,0,0.5)]">
            {registration?.rewardStatus === "AVAILABLE"
              ? "✓ AVAILABLE TO REDEEM"
              : "WELCOME GIFT"}
          </div>
        </div>

        {registration ? (
          <div className="mt-8 w-full max-w-xl rounded-2xl border border-yellow-500/50 bg-zinc-950/90 p-6 shadow-[0_0_25px_rgba(255,190,0,0.15)]">
            <p className="text-sm tracking-[0.25em] text-yellow-300">
              YOUR VIP DETAILS
            </p>

            <p className="mt-5 text-sm text-zinc-400">
              Registered Vehicle
            </p>
            <p className="mt-1 text-2xl font-bold">
              {registration.vehiclePlate}
            </p>

            <p className="mt-5 text-sm text-zinc-400">
              Your VIP Referral Code
            </p>
            <p className="mt-2 break-all text-3xl font-black tracking-wider text-yellow-400">
              {registration.vipCode}
            </p>

            <div className="mt-6 rounded-xl border border-purple-500/50 bg-purple-950/30 p-4 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
              {registration.isInitialMember ? (
                <>
                  <p className="text-xs font-bold tracking-[0.25em] text-purple-300">
                    FOUNDING VIP MEMBER
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">
                    You are the first member of Shine Master Solution VIP Referral Wash.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold tracking-[0.25em] text-purple-300">
                    INVITED BY
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-400">
                    {registration.inviterVehiclePlate || "VIP MEMBER"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Inviter's vehicle plate number
                  </p>
                </>
              )}
            </div>

            <p className="mt-5 text-sm text-zinc-300">
              Your personal referral QR code
            </p>

            {registration.qrCodeDataUrl && (
              <div className="mx-auto mt-4 inline-block rounded-2xl bg-white p-3">
                {/* QR image returned by the registration API */}
                <img
                  src={registration.qrCodeDataUrl}
                  alt="Your personal VIP referral QR code"
                  className="h-56 w-56"
                />
              </div>
            )}

            <p className="mt-4 break-all text-xs text-zinc-500">
              Share your personal QR code with friends to invite them.
            </p>

            <p className="mt-5 text-sm font-bold text-yellow-300">
              REWARD: {registration.reward}
            </p>
          </div>
        ) : (
          <p className="mt-8 max-w-md text-sm text-zinc-400">
            Registration details will appear here after you complete your VIP
            Referral Wash registration.
          </p>
        )}


        <p className="mt-8 text-xs font-bold tracking-[0.3em] text-yellow-400 sm:text-sm">
          DISCOVER THE SHINE. ENJOY THE PRIVILEGE.
        </p>
      </section>
    </main>
  );
}
