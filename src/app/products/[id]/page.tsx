import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/products/actions";
import { AppHeader } from "@/components/AppHeader";
import { categoryIcon, categoryLabel, categoryColor } from "@/lib/categories";
import { formatDate } from "@/lib/dates";
import {
  governingEndDate,
  statusFromEndDate,
  STATUS_LABEL,
  STATUS_CLASSES,
  STATUS_DOT,
} from "@/lib/status";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!product) notFound();

  const { data: warrantyPeriods } = await supabase
    .from("warranty_periods")
    .select("*")
    .eq("product_id", id)
    .order("end_date", { ascending: true });

  const endDates = (warrantyPeriods ?? []).map((w) => w.end_date as string);
  const status = statusFromEndDate(governingEndDate(endDates));
  const deleteWithId = deleteProduct.bind(null, product.id as string);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        <div className="mt-4 flex items-start justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${categoryColor(product.category)}`}
            >
              {categoryIcon(product.category)}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <p className="text-sm text-neutral-500">
                {categoryLabel(product.category)}
                {product.brand ? ` · ${product.brand}` : ""}
                {product.model ? ` ${product.model}` : ""}
              </p>
            </div>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {STATUS_LABEL[status]}
          </span>
        </div>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Purchase details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-neutral-500">Purchase date</dt>
            <dd className="text-foreground">
              {product.purchase_date ? formatDate(product.purchase_date) : "—"}
            </dd>
            <dt className="text-neutral-500">Retailer</dt>
            <dd className="text-foreground">{product.retailer || "—"}</dd>
            <dt className="text-neutral-500">Price</dt>
            <dd className="text-foreground">{product.price ? `₹${product.price}` : "—"}</dd>
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Warranty</h2>
          {warrantyPeriods && warrantyPeriods.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {warrantyPeriods.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-foreground capitalize">{w.type} warranty</span>
                  <span className="text-neutral-500">
                    {formatDate(w.start_date)} → {formatDate(w.end_date)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">No warranty periods added.</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">
          AMC contracts and service records are coming in Phase 2.
        </section>

        <form action={deleteWithId} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Delete product
          </button>
        </form>
      </div>
    </div>
  );
}
