import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MAX_AGE, MIN_AGE, STEPS } from "@/lib/form-schema";
import { ORG_NAME, ORG_PARTNERS, ORG_SHORT } from "@/lib/constants";

const CHECKLIST = [
  {
    title: "A parent or guardian contact",
    body: "Their name and phone number, and their consent for you to apply.",
  },
  {
    title: "A recommendation letter",
    body: "A PDF or a clear photo of a signed letter, up to 10 MB. This is required.",
  },
  {
    title: "One or two recommenders",
    body: "The name and email of someone who can speak for you — a teacher, club leader or mentor.",
  },
  {
    title: "About 20–30 minutes",
    body: "Your answers save on this device as you go, so you can stop and come back.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="bg-ink-950 text-white">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                  Membership Application
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  {ORG_NAME}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">
                  Thank you for your interest in joining {ORG_SHORT}. We are a child-led coalition
                  working to advance children&apos;s rights, participation, and protection in our
                  communities.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300 sm:text-base">
                  In partnership with {ORG_PARTNERS}.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/apply"
                    className="inline-flex items-center justify-center rounded-lg bg-gold-500 px-6 py-3 text-base font-semibold text-ink-950 shadow-sm transition hover:bg-gold-400"
                  >
                    Start your application
                  </Link>
                  <span className="text-sm text-ink-400">
                    Open to applicants aged {MIN_AGE}–{MAX_AGE}
                  </span>
                </div>
              </div>
              <Image
                src="/logos/aclic.png"
                alt=""
                width={200}
                height={200}
                className="hidden size-44 rounded-2xl ring-1 ring-ink-700 md:block"
                priority
              />
            </div>
          </div>
        </section>

        {/* Why we ask */}
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-ink-800 sm:text-base">
              This application helps us understand your background, your motivation, and your
              current understanding of children&apos;s rights, so we can welcome you into the
              coalition in a way that fits your interests and strengths.{" "}
              <strong className="font-semibold">
                Please answer as honestly and completely as you can.
              </strong>{" "}
              There are no wrong answers — we are not testing you.
            </p>
          </div>

          {/* What you'll need */}
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
              Before you start
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {CHECKLIST.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-ink-200 bg-white p-5 shadow-xs"
                >
                  <h3 className="text-[15px] font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
              What the form covers
            </h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.filter((step) => step.id !== "review").map((step) => (
                <li
                  key={step.id}
                  className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-gold-300">
                    {step.number}
                  </span>
                  <span className="text-[15px] font-medium leading-snug text-ink-800">
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Privacy */}
          <div className="mt-12 rounded-xl border border-ink-200 bg-white p-6">
            <h2 className="text-base font-bold text-ink-900">How we handle your information</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Your answers are stored securely and are visible only to designated {ORG_SHORT}{" "}
              coalition staff who review applications. We do not publish them, share them with
              anyone outside the review process, or use them for anything other than your
              membership application. Because applicants are children, a parent or guardian must
              confirm consent before an application can be submitted.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-lg bg-ink-900 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-ink-800"
            >
              Start your application
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
