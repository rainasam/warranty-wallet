import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <Logo size={36} />
          Warranty Wallet
        </Link>
        <div className="flex items-center gap-4">
          {email && <span className="hidden text-sm text-neutral-500 sm:inline">{email}</span>}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-neutral-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
