import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/amc-schedule", label: "AMC Schedule" },
  { href: "/notifications", label: "Notifications" },
];

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <Logo size={36} />
            Warranty Wallet
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-500 transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
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
