import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { categoryIcon, categoryLabel, categoryColor } from "@/lib/categories";
import {
  governingEndDate,
  statusFromEndDate,
  STATUS_LABEL,
  STATUS_CLASSES,
  STATUS_DOT,
  STATUS_ACCENT_BORDER,
  STATUS_SORT_WEIGHT,
  type CoverageStatus,
} from "@/lib/status";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, category, name, brand, model, warranty_periods(end_date)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cards = (products ?? []).map((p) => {
    const endDates = (p.warranty_periods ?? []).map((w) => w.end_date as string);
    const status = statusFromEndDate(governingEndDate(endDates));
    return { ...p, status };
  });

  cards.sort((a, b) => STATUS_SORT_WEIGHT[a.status] - STATUS_SORT_WEIGHT[b.status]);

  const summary = {
    total: cards.length,
    expiringSoon: cards.filter((c) => c.status === "expiring_soon").length,
    expired: cards.filter((c) => c.status === "expired").length,
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your products</h1>
            <p className="mt-1.5 text-base text-neutral-500">
              Everything you own, and its live coverage status.
            </p>
          </div>
          <Link
            href="/products/new"
            className="rounded-lg bg-gradient-to-r from-accent to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
          >
            + Add Product
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Products tracked" value={summary.total} accent="text-foreground" icon="📦" bg="bg-teal-50" />
          <StatTile label="Expiring soon" value={summary.expiringSoon} accent="text-amber-600" icon="⚠️" bg="bg-amber-50" />
          <StatTile label="Expired" value={summary.expired} accent="text-red-600" icon="🚨" bg="bg-red-50" />
        </div>

        {cards.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-4xl">
              🗂️
            </div>
            <p className="mt-5 text-base text-neutral-500">
              No products yet. Add your first one to start tracking its warranty.
            </p>
            <Link
              href="/products/new"
              className="mt-5 inline-block rounded-lg bg-gradient-to-r from-accent to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
            >
              + Add Product
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
  icon,
  bg,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${bg}`}>{icon}</span>
      <div>
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: {
    id: string;
    category: string;
    name: string;
    brand: string | null;
    model: string | null;
    status: CoverageStatus;
  };
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group rounded-2xl border border-neutral-200 border-l-4 ${STATUS_ACCENT_BORDER[product.status]} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${categoryColor(product.category)}`}
        >
          {categoryIcon(product.category)}
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[product.status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[product.status]}`} />
          {STATUS_LABEL[product.status]}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground group-hover:text-accent">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        {categoryLabel(product.category)}
        {product.brand ? ` · ${product.brand}` : ""}
      </p>
    </Link>
  );
}
