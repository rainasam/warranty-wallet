"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addMonths } from "@/lib/dates";

function parseProductFields(formData: FormData) {
  return {
    category: String(formData.get("category")),
    name: String(formData.get("name")),
    brand: String(formData.get("brand") || "") || null,
    model: String(formData.get("model") || "") || null,
    purchase_date: String(formData.get("purchase_date")),
    retailer: String(formData.get("retailer") || "") || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parseProductFields(formData);
  const warrantyMonths = Number(formData.get("warranty_months") || 0);
  const hasExtended = formData.get("has_extended") === "on";
  const extendedMonths = Number(formData.get("extended_months") || 0);

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({ ...fields, user_id: user.id })
    .select("id")
    .single();

  if (productError || !product) {
    redirect(`/products/new?error=${encodeURIComponent(productError?.message ?? "Could not save product")}`);
  }

  const warrantyRows = [];
  let standardEndDate = fields.purchase_date;

  if (warrantyMonths > 0) {
    standardEndDate = addMonths(fields.purchase_date, warrantyMonths);
    warrantyRows.push({
      product_id: product.id,
      type: "standard",
      start_date: fields.purchase_date,
      end_date: standardEndDate,
    });
  }

  if (hasExtended && extendedMonths > 0) {
    warrantyRows.push({
      product_id: product.id,
      type: "extended",
      start_date: standardEndDate,
      end_date: addMonths(standardEndDate, extendedMonths),
    });
  }

  if (warrantyRows.length > 0) {
    await supabase.from("warranty_periods").insert(warrantyRows);
  }

  revalidatePath("/dashboard");
  redirect(`/products/${product.id}`);
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("products").delete().eq("id", productId).eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
