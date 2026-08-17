import Link from "next/link";
import { redirect } from "next/navigation";
import { createProduct } from "@/app/products/actions";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORIES } from "@/lib/categories";

const FILE_INPUT_CLASS =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent hover:file:bg-teal-100";

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

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Add a product</h1>
        <p className="mt-1.5 text-base text-neutral-500">
          Register the product and activate its warranty in one go.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={createProduct} className="mt-8 space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Category</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {CATEGORIES.map((cat, i) => (
                <label
                  key={cat.value}
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-neutral-200 px-2 py-4 text-center text-xs font-medium text-foreground transition has-checked:border-accent has-checked:bg-teal-50 has-checked:shadow-sm hover:border-neutral-300"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    defaultChecked={i === 0}
                    required
                    className="sr-only"
                  />
                  <cat.icon className="h-6 w-6" />
                  {cat.label}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Product details</h2>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Product name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. iPhone 15"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-foreground">
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-foreground">
                  Model
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Purchase details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchase_date" className="mb-1.5 block text-sm font-medium text-foreground">
                  Purchase date
                </label>
                <input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  required
                  max={today}
                  defaultValue={today}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground">
                  Price paid (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="retailer" className="mb-1.5 block text-sm font-medium text-foreground">
                Retailer
              </label>
              <input
                id="retailer"
                name="retailer"
                type="text"
                placeholder="e.g. Amazon, Croma"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="invoice_file" className="mb-1.5 block text-sm font-medium text-foreground">
                Invoice / receipt (optional)
              </label>
              <input
                id="invoice_file"
                name="invoice_file"
                type="file"
                accept="image/*,.pdf"
                className={FILE_INPUT_CLASS}
              />
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Warranty</h2>

            <div>
              <label htmlFor="warranty_months" className="mb-1.5 block text-sm font-medium text-foreground">
                Standard warranty length (months)
              </label>
              <input
                id="warranty_months"
                name="warranty_months"
                type="number"
                min="0"
                defaultValue={12}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="standard_document" className="mb-1.5 block text-sm font-medium text-foreground">
                Warranty card / certificate (optional)
              </label>
              <input
                id="standard_document"
                name="standard_document"
                type="file"
                accept="image/*,.pdf"
                className={FILE_INPUT_CLASS}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="has_extended"
                id="has_extended"
                className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
              />
              This product has extended warranty
            </label>

            <div>
              <label htmlFor="extended_months" className="mb-1.5 block text-sm font-medium text-foreground">
                Extended warranty — additional months (starts when standard warranty ends)
              </label>
              <input
                id="extended_months"
                name="extended_months"
                type="number"
                min="0"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="extended_document" className="mb-1.5 block text-sm font-medium text-foreground">
                Extended warranty document (optional)
              </label>
              <input
                id="extended_document"
                name="extended_document"
                type="file"
                accept="image/*,.pdf"
                className={FILE_INPUT_CLASS}
              />
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
          >
            Save product
          </button>
        </form>
      </div>
    </div>
  );
}
