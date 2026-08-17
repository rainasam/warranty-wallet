import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const { error, check_email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-10 shadow-lg shadow-neutral-100">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex">
            <Logo size={64} />
          </Link>
          <h1 className="mt-5 text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Register products, activate warranties, never miss a renewal.
          </p>
        </div>

        {check_email ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Check your email for a confirmation link to activate your account.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form action={signup} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
              >
                Create account
              </button>
            </form>
          </>
        )}

        <p className="mt-7 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
