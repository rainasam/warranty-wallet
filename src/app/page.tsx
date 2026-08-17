import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white px-4 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #0d948833 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative">
        <Logo size={96} className="drop-shadow-lg" />
        <h1 className="mt-8 text-6xl font-extrabold tracking-tight text-foreground">
          Warranty Wallet
        </h1>
        <p className="mt-3 text-lg font-medium text-accent">Secure Your Products</p>
        <p className="mt-5 max-w-xl text-lg text-neutral-500">
          Register your products, track every warranty and AMC, and never miss
          a claim or renewal again.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-accent to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-200 transition hover:shadow-xl"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 bg-white px-7 py-3.5 text-base font-semibold text-foreground transition hover:bg-neutral-50"
          >
            Log in
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeaturePill icon="📅" text="Never miss an expiry" />
          <FeaturePill icon="🧾" text="Store every invoice" />
          <FeaturePill icon="🔧" text="Track AMC & service" />
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-600 shadow-sm">
      <span className="text-lg">{icon}</span>
      {text}
    </div>
  );
}
