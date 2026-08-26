"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();

  const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (newPassword.length < 6) {
    redirect("/profile?error=Password must be at least 6 characters.");
  }
  if (newPassword !== confirmPassword) {
    redirect("/profile?error=Passwords do not match.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile?password_changed=1");
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const confirmation = String(formData.get("confirmation") || "");
  if (confirmation !== "DELETE") {
    redirect("/profile?error=Type DELETE to confirm account deletion.");
  }

  const admin = createAdminClient();

  const { data: files } = await admin.storage.from("documents").list(user.id);
  if (files && files.length > 0) {
    await admin.storage.from("documents").remove(files.map((f) => `${user.id}/${f.name}`));
  }

  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();

  redirect("/");
}
