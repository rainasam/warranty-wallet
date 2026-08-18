import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { daysUntil, formatDate } from "@/lib/dates";

const THRESHOLDS = [30, 7, 1, 0];

type PendingItem = {
  entityType: "warranty" | "amc" | "service";
  entityId: string;
  threshold: string;
  label: string;
  date: string;
  daysUntil: number;
};

type UserBucket = {
  email: string;
  items: PendingItem[];
};

export async function runReminderScan(supabase: SupabaseClient, resend: Resend) {
  const { data: products } = await supabase.from("products").select(
    `id, name, user_id,
     warranty_periods(id, type, end_date),
     amc_contracts(id, end_date, start_date, maintenance_interval_months,
       service_records(id, service_date, next_due_date))`,
  );

  const userIds = [...new Set((products ?? []).map((p) => p.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };
  const emailByUserId = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  const buckets = new Map<string, UserBucket>();
  const rowsToLog: {
    user_id: string;
    related_entity_type: string;
    related_entity_id: string;
    threshold: string;
    channel: string;
  }[] = [];

  for (const product of products ?? []) {
    const email = emailByUserId.get(product.user_id);
    if (!email) continue;

    const candidates: Omit<PendingItem, "threshold" | "daysUntil">[] = [];

    for (const w of product.warranty_periods ?? []) {
      candidates.push({
        entityType: "warranty",
        entityId: w.id,
        label: `${w.type === "extended" ? "Extended warranty" : "Warranty"} for ${product.name}`,
        date: w.end_date,
      });
    }

    for (const amc of product.amc_contracts ?? []) {
      candidates.push({
        entityType: "amc",
        entityId: amc.id,
        label: `AMC contract for ${product.name}`,
        date: amc.end_date,
      });

      const records = [...(amc.service_records ?? [])].sort((a, b) =>
        b.service_date.localeCompare(a.service_date),
      );
      const nextDue =
        records.length > 0
          ? records[0].next_due_date
          : amc.maintenance_interval_months
            ? addMonthsSafe(amc.start_date, amc.maintenance_interval_months)
            : null;
      const serviceEntityId = records.length > 0 ? records[0].id : amc.id;

      if (nextDue) {
        candidates.push({
          entityType: "service",
          entityId: serviceEntityId,
          label: `Next service due for ${product.name}`,
          date: nextDue,
        });
      }
    }

    for (const c of candidates) {
      if (!c.date) continue;
      const days = daysUntil(c.date);
      const threshold = THRESHOLDS.find((t) => t === days);
      if (threshold === undefined) continue;

      const bucket: UserBucket = buckets.get(product.user_id) ?? { email, items: [] };
      bucket.items.push({ ...c, threshold: String(threshold), daysUntil: days });
      buckets.set(product.user_id, bucket);

      rowsToLog.push({
        user_id: product.user_id,
        related_entity_type: c.entityType,
        related_entity_id: c.entityId,
        threshold: String(threshold),
        channel: "email",
      });
    }
  }

  if (rowsToLog.length === 0) {
    return { usersNotified: 0, itemsSent: 0 };
  }

  // Skip anything already logged for this exact (user, entity, threshold).
  const { data: existing } = await supabase
    .from("reminder_log")
    .select("user_id, related_entity_type, related_entity_id, threshold")
    .not("sent_at", "is", null);

  const alreadySent = new Set(
    (existing ?? []).map((r) => `${r.user_id}:${r.related_entity_type}:${r.related_entity_id}:${r.threshold}`),
  );

  let itemsSent = 0;
  let usersNotified = 0;
  const from = process.env.RESEND_FROM_EMAIL ?? "Warranty Wallet <onboarding@resend.dev>";

  for (const [userId, bucket] of buckets) {
    const freshItems = bucket.items.filter((item) => {
      const key = `${userId}:${item.entityType}:${item.entityId}:${item.threshold}`;
      return !alreadySent.has(key);
    });

    if (freshItems.length === 0) continue;

    const html = renderReminderEmail(freshItems);

    const { error } = await resend.emails.send({
      from,
      to: bucket.email,
      subject: `Warranty Wallet: ${freshItems.length} item${freshItems.length === 1 ? "" : "s"} need${freshItems.length === 1 ? "s" : ""} your attention`,
      html,
    });

    if (error) {
      console.error(`Reminder email failed for user ${userId}:`, error);
      continue;
    }

    usersNotified += 1;
    itemsSent += freshItems.length;

    const logRows = freshItems.map((item) => ({
      user_id: userId,
      related_entity_type: item.entityType,
      related_entity_id: item.entityId,
      threshold: item.threshold,
      channel: "email",
      sent_at: new Date().toISOString(),
      status: "sent",
    }));

    await supabase.from("reminder_log").insert(logRows);
  }

  return { usersNotified, itemsSent };
}

function addMonthsSafe(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function renderReminderEmail(items: PendingItem[]): string {
  const rows = items
    .map((item) => {
      const status = item.daysUntil < 0 ? "Overdue" : item.daysUntil === 0 ? "Due today" : `In ${item.daysUntil} days`;
      return `<li><strong>${item.label}</strong> — ${formatDate(item.date)} (${status})</li>`;
    })
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>You have upcoming items in Warranty Wallet</h2>
      <ul>${rows}</ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard">Open Warranty Wallet</a></p>
    </div>
  `;
}
