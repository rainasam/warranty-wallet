import Link from "next/link";
import { logout } from "@/app/auth/actions";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-500 text-white shadow-sm">
            🛡️
          </span>
          Warranty Wallet
        </Link>
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-neutral-500 sm:inline">{email}</span>}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-neutral-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
