"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function VIPRegisterPage() {
  const router = useRouter();
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const referralToken = new URLSearchParams(
        window.location.search
      ).get("ref");

      const response = await fetch("/api/vip/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehiclePlate,
          ref: referralToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      sessionStorage.setItem(
        "shineVipRegistration",
        JSON.stringify(result)
      );

      router.push("/vip/welcome");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden bg-black px-5 py-12 text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.40), rgba(0,0,0,0.68)), url('/vip-sports-car.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "scroll",
      }}
    >
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-[0.3em] text-[#d8b66e]">
            SHINE MASTER SOLUTION
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            VIP REFERRAL WASH
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Register today and enjoy your exclusive welcome gift.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-yellow-400/70 bg-black/75 p-6 shadow-[0_0_35px_rgba(212,175,55,0.35)] backdrop-blur-md"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Vehicle Registration Number
            </label>

            <input
              type="text"
              name="vehiclePlate"
              value={vehiclePlate}
              onChange={(event) =>
                setVehiclePlate(event.target.value.toUpperCase())
              }
              required
              maxLength={12}
              placeholder="Example: JXX8888"
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 uppercase text-white outline-none focus:border-[#c9a45c]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#c9a45c] px-6 py-4 font-bold text-black transition hover:bg-[#e0bd77] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "REGISTERING..." : "REGISTER AS VIP"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Your personal referral QR code will be generated after registration.
          </p>
        </form>
      </div>
    </main>
  );
}
