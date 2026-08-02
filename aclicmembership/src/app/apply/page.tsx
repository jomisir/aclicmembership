import type { Metadata } from "next";
import { ApplicationForm } from "@/components/form/ApplicationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Membership application",
  description: "Apply to join the Addis Child-Led Initiatives Coalition.",
};

export default function ApplyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader compact />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm sm:p-8">
            <ApplicationForm />
          </div>

          <p className="mt-6 text-center text-sm text-ink-500">
            Having trouble with the form? Contact an ACLIC focal point and we will help you apply
            another way.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
