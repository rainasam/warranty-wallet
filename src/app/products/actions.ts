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

export async function createAmcContract(productId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const provider = String(formData.get("provider") || "") || null;
  const start_date = String(formData.get("start_date"));
  const end_date = String(formData.get("end_date"));
  const cost = formData.get("cost") ? Number(formData.get("cost")) : null;
  const maintenance_interval_months = formData.get("maintenance_interval_months")
    ? Number(formData.get("maintenance_interval_months"))
    : null;

  const { error } = await supabase.from("amc_contracts").insert({
    product_id: productId,
    provider,
    start_date,
    end_date,
    cost,
    maintenance_interval_months,
  });

  if (error) {
    redirect(`/products/${productId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/dashboard");
  redirect(`/products/${productId}`);
}

export async function deleteAmcContract(amcContractId: string, productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("amc_contracts").delete().eq("id", amcContractId);

  revalidatePath(`/products/${productId}`);
  revalidatePath("/dashboard");
  redirect(`/products/${productId}`);
}

export async function createServiceRecord(
  amcContractId: string,
  productId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service_date = String(formData.get("service_date"));
  const technician = String(formData.get("technician") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  const cost = formData.get("cost") ? Number(formData.get("cost")) : null;

  const { data: amc } = await supabase
    .from("amc_contracts")
    .select("maintenance_interval_months")
    .eq("id", amcContractId)
    .single();

  const next_due_date =
    amc?.maintenance_interval_months && amc.maintenance_interval_months > 0
      ? addMonths(service_date, amc.maintenance_interval_months)
      : null;

  const { error } = await supabase.from("service_records").insert({
    amc_contract_id: amcContractId,
    product_id: productId,
    service_date,
    technician,
    notes,
    cost,
    next_due_date,
  });

  if (error) {
    redirect(`/products/${productId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/dashboard");
  redirect(`/products/${productId}`);
}
