import { PublicHeader } from "@/components/PublicHeader";

const FAQS = [
  {
    q: "What's the difference between warranty and AMC?",
    a: "A warranty is the manufacturer's free coverage for defects, usually 1–2 years from purchase. An AMC (Annual Maintenance Contract) is a paid service agreement — often started after the warranty ends — that covers routine servicing and repairs for a fee. Warranty Wallet tracks both, separately, for every product.",
  },
  {
    q: "How is a product's status (Active / Expiring Soon / Expired) calculated?",
    a: "We look at the furthest-out end date across a product's standard warranty, extended warranty, and AMC contract. If that date is more than 30 days away, the product is Active. Within 30 days, it's Expiring Soon. Once it's passed, it's Expired.",
  },
  {
    q: "How does the AMC service schedule work?",
    a: "When you add an AMC contract, you can set a maintenance interval (e.g. every 6 months). Every time you log a completed service visit, we automatically calculate the next due date from that interval, so you always know when the next service is coming up.",
  },
  {
    q: "What happens when I hit the free plan's product limit?",
    a: "The free plan tracks up to 5 products. Once you reach that limit, adding a new product will prompt you to upgrade to the paid plan for unlimited products.",
  },
  {
    q: "Is my data (invoices, warranty cards, AMC documents) secure?",
    a: "Yes. Uploaded documents are stored in a private file store and are only ever accessible to your own account — not to other users, and not publicly.",
  },
  {
    q: "Do you send reminders before something expires?",
    a: "Automated email reminders are on the roadmap and not live yet. For now, check your Dashboard or the AMC Schedule page to see what's coming up.",
  },
  {
    q: "Can I edit a product after adding it?",
    a: "Product editing is on the roadmap. For now you can delete and re-add a product if details need to change.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Frequently asked questions</h1>
        <p className="mt-2 text-base text-neutral-500">
          Everything you need to know about how Warranty Wallet works.
        </p>

        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none">
                <span className="flex items-center justify-between">
                  {item.q}
                  <span className="ml-4 shrink-0 text-neutral-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-neutral-500">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
