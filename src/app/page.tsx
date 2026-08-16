import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-violet-500 text-3xl shadow-lg shadow-indigo-200">
        🛡️
      </span>
      <h1 className="mt-6 text-4xl font-semibold text-foreground">Warranty Wallet</h1>
      <p className="mt-4 max-w-md text-neutral-500">
        Register your products, track every warranty and AMC, and never miss
        a claim or renewal again.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-gradient-to-r from-accent to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition hover:shadow-md"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-neutral-50"
        >
          Log in
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FeaturePill icon="📅" text="Never miss an expiry" />
        <FeaturePill icon="🧾" text="Store every invoice" />
        <FeaturePill icon="🔧" text="Track AMC & service" />
      </div>
    </div>
  );
}

function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
      <span>{icon}</span>
      {text}
    </div>
  );
}
