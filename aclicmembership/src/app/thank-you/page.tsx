import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ORG_SHORT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader compact />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7 text-emerald-700"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Your application has been received
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              Thank you for applying to join {ORG_SHORT}. Our team reviews every application and
              will contact you using the phone number or email you gave us.
            </p>

            {ref ? (
              <div className="mt-8 rounded-xl border border-gold-200 bg-gold-50 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-800">
                  Your reference
                </p>
                <p className="mt-1.5 font-mono text-xl font-bold tracking-wide text-ink-900">
                  {ref}
                </p>
                <p className="mt-2 text-sm text-ink-600">
                  Write this down. Quote it whenever you contact us about your application.
                </p>
              </div>
            ) : null}

            <div className="mt-8 text-left">
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-500">
                What happens next
              </h2>
              <ol className="mt-3 grid gap-3 text-[15px] leading-relaxed text-ink-700">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-gold-300">
                    1
                  </span>
                  A coalition focal point reviews your answers and your recommendation letter.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-gold-300">
                    2
                  </span>
                  We may contact your recommender or your parent/guardian.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-gold-300">
                    3
                  </span>
                  If accepted, you will be invited to an orientation session.
                </li>
              </ol>
            </div>

            <Link
              href="/"
              className="mt-10 inline-flex items-center justify-center rounded-lg border border-ink-300 px-6 py-2.5 text-[15px] font-semibold text-ink-800 transition hover:bg-ink-50"
            >
              Back to the start
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
