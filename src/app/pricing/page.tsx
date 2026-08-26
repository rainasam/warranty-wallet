import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

const FEATURES = [
  { label: "Products tracked", free: "Up to 5", paid: "Unlimited" },
  { label: "Standard warranty tracking", free: true, paid: true },
  { label: "Extended warranty tracking", free: true, paid: true },
  { label: "AMC & maintenance tracking", free: true, paid: true },
  { label: "Document uploads", free: "Limited storage", paid: "Higher storage" },
  { label: "Email reminders", free: true, paid: true },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Simple, honest pricing</h1>
          <p className="mt-2 text-base text-neutral-500">
            Start free. Upgrade when you outgrow it.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Free</h2>
            <p className="mt-1 text-3xl font-bold text-foreground">₹0</p>
            <p className="mt-1 text-sm text-neutral-500">Forever</p>
          </div>
          <div className="rounded-2xl border-2 border-accent bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-accent">Paid</h2>
            <p className="mt-1 text-3xl font-bold text-foreground">Pricing TBD</p>
            <p className="mt-1 text-sm text-neutral-500">Monthly / annual options coming soon</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-foreground">Free</th>
                <th className="px-6 py-4 text-center font-semibold text-accent">Paid</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.label} className="border-b border-neutral-100 last:border-0">
                  <td className="px-6 py-4 text-neutral-600">{f.label}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof f.free === "boolean" ? (f.free ? "✅" : "—") : f.free}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof f.paid === "boolean" ? (f.paid ? "✅" : "—") : f.paid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="text-sm text-neutral-500">
            Paid plan payment isn&apos;t live yet. Interested in upgrading early?
          </p>
          <Link
            href="/feedback"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-accent to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
          >
            Let us know
          </Link>
        </div>
      </div>
    </div>
  );
}
