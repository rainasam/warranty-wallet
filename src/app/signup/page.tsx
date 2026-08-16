import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const { error, check_email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet-500 text-2xl shadow-sm">
            🛡️
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Register products, activate warranties, never miss a renewal.
          </p>
        </div>

        {check_email ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Check your email for a confirmation link to activate your account.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form action={signup} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-gradient-to-r from-accent to-violet-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
              >
                Create account
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
