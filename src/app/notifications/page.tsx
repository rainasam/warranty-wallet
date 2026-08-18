import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

const TYPE_LABEL: Record<string, string> = {
  warranty: "Warranty",
  amc: "AMC contract",
  service: "Service due",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("reminder_log")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false });

  const warrantyIds = (logs ?? []).filter((l) => l.related_entity_type === "warranty").map((l) => l.related_entity_id);
  const amcIds = (logs ?? []).filter((l) => l.related_entity_type === "amc").map((l) => l.related_entity_id);
  const serviceIds = (logs ?? []).filter((l) => l.related_entity_type === "service").map((l) => l.related_entity_id);

  const [{ data: warrantyRows }, { data: amcRows }, { data: serviceRows }] = await Promise.all([
    warrantyIds.length
      ? supabase.from("warranty_periods").select("id, products(name)").in("id", warrantyIds)
      : Promise.resolve({ data: [] }),
    amcIds.length
      ? supabase.from("amc_contracts").select("id, products(name)").in("id", amcIds)
      : Promise.resolve({ data: [] }),
    serviceIds.length
      ? supabase.from("service_records").select("id, products(name)").in("id", serviceIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameById = new Map<string, string>();
  for (const row of warrantyRows ?? []) nameById.set(row.id, (row.products as unknown as { name: string } | null)?.name ?? "");
  for (const row of amcRows ?? []) nameById.set(row.id, (row.products as unknown as { name: string } | null)?.name ?? "");
  for (const row of serviceRows ?? []) nameById.set(row.id, (row.products as unknown as { name: string } | null)?.name ?? "");

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1.5 text-base text-neutral-500">
          A log of every reminder email that&apos;s been sent to you.
        </p>

        {logs && logs.length > 0 ? (
          <ul className="mt-8 space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {TYPE_LABEL[log.related_entity_type] ?? log.related_entity_type}
                    {nameById.get(log.related_entity_id) ? ` — ${nameById.get(log.related_entity_id)}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {log.threshold === "0" ? "Due today" : `${log.threshold} day${log.threshold === "1" ? "" : "s"} before due`}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">
                  {log.sent_at ? new Date(log.sent_at).toLocaleDateString("en-IN") : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-sm text-neutral-500">No reminders sent yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
