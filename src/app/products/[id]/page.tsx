import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProduct,
  createAmcContract,
  deleteAmcContract,
  createServiceRecord,
} from "@/app/products/actions";
import { AppHeader } from "@/components/AppHeader";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryLabel, categoryColor } from "@/lib/categories";
import { formatDate, addMonths } from "@/lib/dates";
import {
  governingEndDate,
  statusFromEndDate,
  STATUS_LABEL,
  STATUS_CLASSES,
  STATUS_DOT,
} from "@/lib/status";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
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

  const { data: amc } = await supabase
    .from("amc_contracts")
    .select("*")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: serviceRecords } = amc
    ? await supabase
        .from("service_records")
        .select("*")
        .eq("amc_contract_id", amc.id)
        .order("service_date", { ascending: false })
    : { data: [] };

  const nextServiceDue =
    serviceRecords && serviceRecords.length > 0
      ? serviceRecords[0].next_due_date
      : amc?.maintenance_interval_months
        ? addMonths(amc.start_date, amc.maintenance_interval_months)
        : null;

  const warrantyEndDates = (warrantyPeriods ?? []).map((w) => w.end_date as string);
  const endDates = amc ? [...warrantyEndDates, amc.end_date as string] : warrantyEndDates;
  const status = statusFromEndDate(governingEndDate(endDates));

  const deleteProductWithId = deleteProduct.bind(null, product.id as string);
  const createAmcForProduct = createAmcContract.bind(null, product.id as string);
  const deleteAmcWithIds = amc ? deleteAmcContract.bind(null, amc.id as string, product.id as string) : undefined;
  const createServiceForAmc = amc
    ? createServiceRecord.bind(null, amc.id as string, product.id as string)
    : undefined;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-start justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-16 w-16 items-center justify-center rounded-full ${categoryColor(product.category)}`}
            >
              <CategoryIcon value={product.category} className="h-7 w-7" />
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

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">AMC contract</h2>
            {amc && nextServiceDue && (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Next service: {formatDate(nextServiceDue)}
              </span>
            )}
          </div>

          {amc ? (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-neutral-500">Provider</dt>
                <dd className="text-foreground">{amc.provider || "—"}</dd>
                <dt className="text-neutral-500">Contract period</dt>
                <dd className="text-foreground">
                  {formatDate(amc.start_date)} → {formatDate(amc.end_date)}
                </dd>
                <dt className="text-neutral-500">Cost</dt>
                <dd className="text-foreground">{amc.cost ? `₹${amc.cost}` : "—"}</dd>
                <dt className="text-neutral-500">Maintenance interval</dt>
                <dd className="text-foreground">
                  {amc.maintenance_interval_months
                    ? `Every ${amc.maintenance_interval_months} month${amc.maintenance_interval_months === 1 ? "" : "s"}`
                    : "—"}
                </dd>
              </dl>

              <form action={deleteAmcWithIds} className="mt-4">
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                >
                  Delete AMC contract
                </button>
              </form>

              <div className="mt-6 border-t border-neutral-100 pt-6">
                <h3 className="text-sm font-semibold text-foreground">Service history</h3>
                {serviceRecords && serviceRecords.length > 0 ? (
                  <ul className="mt-3 space-y-2.5">
                    {serviceRecords.map((s) => (
                      <li key={s.id} className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{formatDate(s.service_date)}</span>
                          <span className="text-neutral-500">
                            {s.cost ? `₹${s.cost}` : ""}
                          </span>
                        </div>
                        {(s.technician || s.notes) && (
                          <p className="mt-1 text-neutral-500">
                            {s.technician ? `${s.technician}` : ""}
                            {s.technician && s.notes ? " · " : ""}
                            {s.notes || ""}
                          </p>
                        )}
                        {s.next_due_date && (
                          <p className="mt-1 text-xs text-teal-700">
                            Next due: {formatDate(s.next_due_date)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-neutral-500">No service visits logged yet.</p>
                )}

                <form action={createServiceForAmc} className="mt-5 space-y-3 rounded-xl bg-neutral-50 p-4">
                  <p className="text-sm font-medium text-foreground">Log a service visit</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="service_date" className="mb-1 block text-xs font-medium text-neutral-500">
                        Service date
                      </label>
                      <input
                        id="service_date"
                        name="service_date"
                        type="date"
                        required
                        max={today}
                        defaultValue={today}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="cost" className="mb-1 block text-xs font-medium text-neutral-500">
                        Cost (₹)
                      </label>
                      <input
                        id="cost"
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="technician" className="mb-1 block text-xs font-medium text-neutral-500">
                      Technician / provider
                    </label>
                    <input
                      id="technician"
                      name="technician"
                      type="text"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="mb-1 block text-xs font-medium text-neutral-500">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md"
                  >
                    Log service
                  </button>
                </form>
              </div>
            </>
          ) : (
            <form action={createAmcForProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="provider" className="mb-1.5 block text-sm font-medium text-foreground">
                    Provider
                  </label>
                  <input
                    id="provider"
                    name="provider"
                    type="text"
                    placeholder="e.g. Local dealer, OEM AMC"
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="cost" className="mb-1.5 block text-sm font-medium text-foreground">
                    Cost (₹)
                  </label>
                  <input
                    id="cost"
                    name="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="mb-1.5 block text-sm font-medium text-foreground">
                    Contract start
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    defaultValue={today}
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="mb-1.5 block text-sm font-medium text-foreground">
                    Contract end
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="maintenance_interval_months" className="mb-1.5 block text-sm font-medium text-foreground">
                  Maintenance interval (months)
                </label>
                <input
                  id="maintenance_interval_months"
                  name="maintenance_interval_months"
                  type="number"
                  min="0"
                  placeholder="e.g. 6"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Add AMC contract
              </button>
            </form>
          )}
        </section>

        <form action={deleteProductWithId} className="mt-6">
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
