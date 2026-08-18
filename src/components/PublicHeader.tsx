import Link from "next/link";
import { Logo } from "@/components/Logo";

export function PublicHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <Logo size={32} />
          Warranty Wallet
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-neutral-500 hover:text-foreground">
          Go to dashboard
        </Link>
      </div>
    </header>
  );
}
