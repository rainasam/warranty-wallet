import { PublicHeader } from "@/components/PublicHeader";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Draft version — last updated placeholder. This is a starting draft and has not been
          reviewed by a lawyer; review before relying on it for a real public launch.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-sm leading-relaxed text-neutral-600">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Information we collect</h2>
            <p className="mt-2">
              When you use Warranty Wallet, we collect: account information (email address,
              password — stored securely hashed, never in plain text); product information you
              choose to enter (product name, category, brand, model, purchase date, retailer,
              price); warranty, AMC, and service record details you enter; and any documents you
              choose to upload (invoices, warranty cards, AMC contracts, service bills).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. How we use your information</h2>
            <p className="mt-2">
              We use your information solely to provide the Warranty Wallet service to you:
              displaying your registered products and their coverage status, calculating warranty
              and AMC/service due dates, and (once live) sending you reminder emails about
              upcoming expiries and renewals. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Data storage and security</h2>
            <p className="mt-2">
              Your data is stored with our infrastructure provider (Supabase) using
              industry-standard security practices, including row-level access controls that
              ensure only you can access your own products, warranty details, and uploaded
              documents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Your rights</h2>
            <p className="mt-2">
              You may access, update, or delete your account and associated data at any time from
              your profile settings. Deleting your account permanently removes your products,
              warranty/AMC records, and uploaded documents.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
            <p className="mt-2">
              Questions about this policy can be sent via the Feedback page in the app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
