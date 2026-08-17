import { CATEGORIES } from "@/lib/categories";

export function CategoryIcon({ value, className }: { value: string; className?: string }) {
  const category = CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
  return <category.icon className={className} />;
}
