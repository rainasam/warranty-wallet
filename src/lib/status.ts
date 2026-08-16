import { daysUntil } from "@/lib/dates";

export type CoverageStatus = "active" | "expiring_soon" | "expired" | "none";

const EXPIRING_SOON_THRESHOLD_DAYS = 30;

// The governing date is the furthest-out coverage end date: as long as any
// warranty/AMC period is still active, the product is covered.
export function governingEndDate(endDates: string[]): string | null {
  const valid = endDates.filter(Boolean);
  if (valid.length === 0) return null;
  return valid.reduce((latest, d) => (d > latest ? d : latest));
}

export function statusFromEndDate(endDate: string | null): CoverageStatus {
  if (!endDate) return "none";
  const days = daysUntil(endDate);
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_THRESHOLD_DAYS) return "expiring_soon";
  return "active";
}

export const STATUS_LABEL: Record<CoverageStatus, string> = {
  active: "Active",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  none: "No warranty added",
};

export const STATUS_CLASSES: Record<CoverageStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  expiring_soon: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  none: "bg-neutral-50 text-neutral-500 border-neutral-200",
};

export const STATUS_DOT: Record<CoverageStatus, string> = {
  active: "bg-green-500",
  expiring_soon: "bg-amber-500",
  expired: "bg-red-500",
  none: "bg-neutral-300",
};

export const STATUS_ACCENT_BORDER: Record<CoverageStatus, string> = {
  active: "border-l-green-400",
  expiring_soon: "border-l-amber-400",
  expired: "border-l-red-400",
  none: "border-l-neutral-200",
};

// Lower sorts first: expired/expiring soon should float to the top of the dashboard.
export const STATUS_SORT_WEIGHT: Record<CoverageStatus, number> = {
  expired: 0,
  expiring_soon: 1,
  active: 2,
  none: 3,
};
