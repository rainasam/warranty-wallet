import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { setInitialPassword } from "@/app/auth/actions";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-10 shadow-lg shadow-neutral-100">
        <div className="mb-8 text-center">
          <Logo size={64} className="mx-auto" />
          <h1 className="mt-5 text-3xl font-bold text-foreground">Create a password</h1>
          <p className="mt-2 text-sm text-neutral-500">
            You signed up with Google. Add a password so you can also log in with{" "}
            {user.email} directly next time — totally optional.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={setInitialPassword} className="space-y-5">
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="New password"
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <input
            name="confirm_password"
            type="password"
            required
            minLength={6}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
          >
            Save password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/dashboard" className="font-semibold text-accent hover:text-accent-hover">
            Skip for now
          </Link>
        </p>
      </div>
    </div>
  );
}
