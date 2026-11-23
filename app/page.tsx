
export default function Home() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 rounded-full border border-[#c9a45c]/40 px-5 py-2 text-xs tracking-[0.3em] text-[#d8b66e]">
          SHINE MASTER SOLUTION
        </div>

        <h1 className="text-4xl font-bold tracking-wide sm:text-6xl">
          SHINE MASTER
          <span className="mt-2 block text-[#d8b66e]">
            VIP REFERRAL WASH
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
          Enjoy exclusive car wash rewards. Invite your friends,
          earn referral recognition and experience premium car care.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
          <a
            href="/vip/register"
            className="rounded-xl bg-[#c9a45c] px-8 py-4 font-semibold text-black transition hover:bg-[#e0bd77]"
          >
            JOIN VIP REFERRAL WASH
          </a>

          <a
            href="/admin"
            className="rounded-xl border border-white/20 px-8 py-4 text-white transition hover:bg-white/10"
          >
            ADMIN LOGIN
          </a>
        </div>

        <p className="mt-16 text-xs tracking-widest text-zinc-600">
          DISCOVER THE SHINE. ENJOY THE PRIVILEGE.
        </p>
      </section>
    </main>
  );
}
