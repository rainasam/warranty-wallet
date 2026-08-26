import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/feedback", label: "Feedback" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6 text-sm text-neutral-500">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
