import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryColor } from "@/lib/categories";
import { formatDate, addMonths, daysUntil } from "@/lib/dates";

type ScheduleItem = {
  productId: string;
  productName: string;
  category: string;
  label: string;
  date: string;
};

export default async function AmcSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, category, amc_contracts(id, end_date, start_date, maintenance_interval_months, service_records(service_date, next_due_date))",
    )
    .eq("user_id", user.id)
    .order("name");

  const items: ScheduleItem[] = [];

  for (const product of products ?? []) {
    for (const amc of product.amc_contracts ?? []) {
      items.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        label: "AMC renewal",
        date: amc.end_date,
      });

      const records = [...(amc.service_records ?? [])].sort((a, b) =>
        b.service_date.localeCompare(a.service_date),
      );

      const nextServiceDue =
        records.length > 0
          ? records[0].next_due_date
          : amc.maintenance_interval_months
            ? addMonths(amc.start_date, amc.maintenance_interval_months)
            : null;

      if (nextServiceDue) {
        items.push({
          productId: product.id,
          productName: product.name,
          category: product.category,
          label: "Next service due",
          date: nextServiceDue,
        });
      }
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-foreground">AMC schedule</h1>
        <p className="mt-1.5 text-base text-neutral-500">
          Every AMC renewal and upcoming service, across all products, soonest first.
        </p>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-sm text-neutral-500">
              No AMC contracts yet. Add one from a product&apos;s detail page to see it here.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((item, i) => {
              const days = daysUntil(item.date);
              const overdue = days < 0;
              const soon = days >= 0 && days <= 30;
              return (
                <li key={`${item.productId}-${item.label}-${i}`}>
                  <Link
                    href={`/products/${item.productId}`}
                    className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${categoryColor(item.category)}`}
                    >
                      <CategoryIcon value={item.category} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
                      <p className="text-sm text-neutral-500">{item.label}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          overdue ? "text-red-600" : soon ? "text-amber-600" : "text-foreground"
                        }`}
                      >
                        {formatDate(item.date)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {overdue ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
