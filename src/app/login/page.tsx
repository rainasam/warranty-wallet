import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-10 shadow-lg shadow-neutral-100">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex">
            <Logo size={64} />
          </Link>
          <h1 className="mt-5 text-3xl font-bold text-foreground">
            Log in
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Track every warranty, AMC, and service record in one place.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <GoogleSignInButton />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs font-medium text-neutral-400">OR</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={login} className="space-y-5">
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
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
          >
            Log in
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:text-accent-hover">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
