import { PublicHeader } from "@/components/PublicHeader";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <PublicHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Draft version — last updated placeholder. This is a starting draft and has not been
          reviewed by a lawyer; review before relying on it for a real public launch.
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-sm leading-relaxed text-neutral-600">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of terms</h2>
            <p className="mt-2">
              By creating an account and using Warranty Wallet, you agree to these terms. If you
              do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. The service</h2>
            <p className="mt-2">
              Warranty Wallet is a personal record-keeping tool that helps you track product
              warranties, AMC contracts, and service history that you enter yourself. We do not
              verify warranty terms with manufacturers or retailers, and dates/status shown in the
              app are based entirely on information you provide.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Free and paid plans</h2>
            <p className="mt-2">
              Warranty Wallet offers a free plan with a limited number of tracked products, and a
              paid plan with additional limits/features. Pricing and feature details are shown on
              the Pricing page and may change with notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Your responsibilities</h2>
            <p className="mt-2">
              You are responsible for the accuracy of the information you enter, for keeping your
              account credentials secure, and for using the service lawfully. Do not use Warranty
              Wallet to store information you do not have the right to store.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Limitation of liability</h2>
            <p className="mt-2">
              Warranty Wallet is a tracking and reminder tool, not a substitute for reading your
              actual warranty/AMC documents. We are not liable for missed claims, lapsed
              renewals, or losses arising from reliance on information or reminders provided by
              the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">6. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
