import Link from "next/link";
import { redirect } from "next/navigation";
import { createProduct } from "@/app/products/actions";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORIES } from "@/lib/categories";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Add a product</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Register the product and activate its warranty in one go.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={createProduct} className="mt-6 space-y-5">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Category</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {CATEGORIES.map((cat, i) => (
                <label
                  key={cat.value}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-neutral-200 px-2 py-3 text-center text-xs text-foreground transition has-checked:border-accent has-checked:bg-indigo-50 has-checked:shadow-sm hover:border-neutral-300"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    defaultChecked={i === 0}
                    required
                    className="sr-only"
                  />
                  <span className="text-xl">{cat.icon}</span>
                  {cat.label}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Product details</h2>

            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                Product name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. iPhone 15"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="mb-1 block text-sm font-medium text-foreground">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="model" className="mb-1 block text-sm font-medium text-foreground">
                  Model
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Purchase details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchase_date" className="mb-1 block text-sm font-medium text-foreground">
                  Purchase date
                </label>
                <input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  required
                  max={today}
                  defaultValue={today}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="price" className="mb-1 block text-sm font-medium text-foreground">
                  Price paid (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="retailer" className="mb-1 block text-sm font-medium text-foreground">
                Retailer
              </label>
              <input
                id="retailer"
                name="retailer"
                type="text"
                placeholder="e.g. Amazon, Croma"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Warranty</h2>

            <div>
              <label htmlFor="warranty_months" className="mb-1 block text-sm font-medium text-foreground">
                Standard warranty length (months)
              </label>
              <input
                id="warranty_months"
                name="warranty_months"
                type="number"
                min="0"
                defaultValue={12}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="has_extended"
                id="has_extended"
                className="rounded border-neutral-300 text-accent focus:ring-accent"
              />
              This product has extended warranty
            </label>

            <div>
              <label htmlFor="extended_months" className="mb-1 block text-sm font-medium text-foreground">
                Extended warranty — additional months (starts when standard warranty ends)
              </label>
              <input
                id="extended_months"
                name="extended_months"
                type="number"
                min="0"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-accent to-violet-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          >
            Save product
          </button>
        </form>
      </div>
    </div>
  );
}
