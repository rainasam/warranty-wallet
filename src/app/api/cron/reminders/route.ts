import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { runReminderScan } from "@/lib/reminders";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    const queryToken = request.nextUrl.searchParams.get("secret");
    const authorized = authHeader === `Bearer ${secret}` || queryToken === secret;
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await runReminderScan(supabase, resend);

  return NextResponse.json(result);
}
