import {
  Smartphone,
  Laptop,
  Tv,
  WashingMachine,
  Refrigerator,
  Headphones,
  Watch,
  ChefHat,
  Package,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIES = [
  { value: "mobile", label: "Mobile", icon: Smartphone, color: "bg-blue-50 text-blue-600" },
  { value: "laptop", label: "Laptop", icon: Laptop, color: "bg-slate-100 text-slate-700" },
  { value: "tv", label: "TV", icon: Tv, color: "bg-purple-50 text-purple-600" },
  { value: "washing_machine", label: "Washing Machine", icon: WashingMachine, color: "bg-cyan-50 text-cyan-600" },
  { value: "refrigerator_ac", label: "Refrigerator/AC", icon: Refrigerator, color: "bg-sky-50 text-sky-600" },
  { value: "audio", label: "Audio", icon: Headphones, color: "bg-pink-50 text-pink-600" },
  { value: "watch", label: "Watch/Wearable", icon: Watch, color: "bg-amber-50 text-amber-600" },
  { value: "kitchen", label: "Kitchen Appliance", icon: ChefHat, color: "bg-orange-50 text-orange-600" },
  { value: "other", label: "Other", icon: Package, color: "bg-neutral-100 text-neutral-600" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryIcon(value: string): LucideIcon {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? Package;
}

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
}

export function categoryColor(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.color ?? "bg-neutral-100 text-neutral-600";
}
