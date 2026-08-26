import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_PRODUCT_LIMIT = 5;

export async function getPlanUsage(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).single(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  const plan: "free" | "paid" = profile?.plan === "paid" ? "paid" : "free";
  const productCount = count ?? 0;
  const limit = plan === "paid" ? null : FREE_PRODUCT_LIMIT;
  const atLimit = limit !== null && productCount >= limit;

  return { plan, productCount, limit, atLimit };
}
