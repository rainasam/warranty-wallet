import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { getPlanUsage } from "@/lib/plan";
import { updateName, changePassword, deleteAccount } from "@/app/profile/actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; password_changed?: string }>;
}) {
  const { error, saved, password_changed } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, usage] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).single(),
    getPlanUsage(supabase, user.id),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1.5 text-base text-neutral-500">Manage your account and plan.</p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Name updated.
          </div>
        )}
        {password_changed && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Password updated.
          </div>
        )}

        {/* Plan usage */}
        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {usage.plan === "paid" ? "Paid plan" : "Free plan"}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {usage.limit
                  ? `${usage.productCount}/${usage.limit} products used`
                  : `${usage.productCount} products tracked · unlimited`}
              </p>
            </div>
            {usage.plan === "free" && (
              <Link
                href="/pricing"
                className="rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Upgrade
              </Link>
            )}
          </div>
          {usage.limit && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-blue-600"
                style={{ width: `${Math.min(100, (usage.productCount / usage.limit) * 100)}%` }}
              />
            </div>
          )}
        </section>

        {/* Name */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Name</h2>
          <form action={updateName} className="mt-4 flex gap-3">
            <input
              name="name"
              type="text"
              defaultValue={profile?.name ?? ""}
              placeholder="Your name"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Save
            </button>
          </form>
          <p className="mt-4 text-xs text-neutral-400">Email: {user.email} (cannot be changed here)</p>
        </section>

        {/* Password */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Change password</h2>
          <form action={changePassword} className="mt-4 space-y-3">
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              placeholder="New password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Update password
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-base font-semibold text-red-800">Delete account</h2>
          <p className="mt-1 text-sm text-red-700">
            Permanently deletes your account, all products, warranty/AMC records, service history,
            and uploaded documents. This cannot be undone.
          </p>
          <form action={deleteAccount} className="mt-4 flex gap-3">
            <input
              name="confirmation"
              type="text"
              required
              placeholder='Type "DELETE" to confirm'
              className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Delete account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
