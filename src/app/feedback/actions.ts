"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const message = String(formData.get("message") || "").trim();
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw ? Number(ratingRaw) : null;

  if (!message) {
    redirect("/feedback?error=Please enter a message.");
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    message,
    rating,
  });

  if (error) {
    redirect(`/feedback?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/feedback?sent=1");
}
