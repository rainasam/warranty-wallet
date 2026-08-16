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

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your products</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Everything you own, and its live coverage status.
            </p>
          </div>
          <Link
            href="/products/new"
            className="rounded-md bg-gradient-to-r from-accent to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          >
            + Add Product
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Products tracked" value={summary.total} accent="text-foreground" icon="📦" />
          <StatTile label="Expiring soon" value={summary.expiringSoon} accent="text-amber-600" icon="⚠️" />
          <StatTile label="Expired" value={summary.expired} accent="text-red-600" icon="🚨" />
        </div>

        {cards.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
              🗂️
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              No products yet. Add your first one to start tracking its warranty.
            </p>
            <Link
              href="/products/new"
              className="mt-4 inline-block rounded-md bg-gradient-to-r from-accent to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
            >
              + Add Product
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xl">{icon}</span>
      <div>
        <p className={`text-xl font-semibold ${accent}`}>{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
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
      className={`group rounded-xl border border-neutral-200 border-l-4 ${STATUS_ACCENT_BORDER[product.status]} bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${categoryColor(product.category)}`}
        >
          {categoryIcon(product.category)}
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[product.status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[product.status]}`} />
          {STATUS_LABEL[product.status]}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-accent">
        {product.name}
      </h3>
      <p className="mt-0.5 text-xs text-neutral-500">
        {categoryLabel(product.category)}
        {product.brand ? ` · ${product.brand}` : ""}
      </p>
    </Link>
  );
}
