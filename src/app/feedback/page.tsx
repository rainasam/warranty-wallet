import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { submitFeedback } from "@/app/feedback/actions";

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground">
          ← Back to dashboard
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-foreground">Feedback</h1>
        <p className="mt-1.5 text-base text-neutral-500">
          Tell us what&apos;s working, what&apos;s not, or what you&apos;d like to see next.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
            <p>Thanks for the feedback — it&apos;s been recorded.</p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm font-semibold text-green-800 underline underline-offset-2"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <form action={submitFeedback} className="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                Your message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="What's on your mind?"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-foreground">
                Rating (optional)
              </legend>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-300 text-sm font-medium text-foreground transition has-checked:border-accent has-checked:bg-teal-50 has-checked:text-accent"
                  >
                    <input type="radio" name="rating" value={n} className="sr-only" />
                    {n}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-accent to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-100 transition hover:shadow-lg"
            >
              Send feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
