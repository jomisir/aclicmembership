import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminContext } from "@/lib/auth";
import {
  DECLARATION_TEXT,
  SAFEGUARDING_TEXT,
} from "@/lib/form-schema";
import { formatDate, formatDateTime, meetingLabel, timeCommitmentLabel } from "@/lib/labels";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApplicationRow } from "@/lib/types";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Answer({ label, children }: { label: string; children: ReactNode }) {
  const empty =
    children === null ||
    children === undefined ||
    (typeof children === "string" && children.trim() === "");

  return (
    <div className="border-b border-ink-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd
        className={`mt-1 text-[15px] leading-relaxed whitespace-pre-line ${
          empty ? "text-ink-400 italic" : "text-ink-900"
        }`}
      >
        {empty ? "Not provided" : children}
      </dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="print-block rounded-xl border border-ink-200 bg-white p-5">
      <h2 className="text-base font-bold text-ink-900">{title}</h2>
      <dl className="mt-2">{children}</dl>
    </section>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await requireAdminContext();
  if (!context.admin) notFound();

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const application = data as ApplicationRow;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="no-print text-sm font-medium text-ink-500 underline-offset-2 hover:underline"
      >
        ← All applications
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-ink-500">
            {application.reference_code}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
            {application.structure_name}
          </h1>
          <p className="mt-1 text-[15px] text-ink-600">
            Led by {application.lead_child_full_name} · age {application.age} ·{" "}
            {application.woreda_subcity_city}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Submitted {formatDateTime(application.created_at)}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="grid gap-5">
          <Panel title="1. Personal Information">
            <Answer label="Name of the structure">{application.structure_name}</Answer>
            <Answer label="Child leading the structure">
              {application.lead_child_full_name}
            </Answer>
            <Answer label="Age">{String(application.age)}</Answer>
            <Answer label="Gender">{application.gender}</Answer>
            <Answer label="Active members">
              {`F = ${application.members_female} · M = ${application.members_male} · Total = ${application.members_total}`}
            </Answer>
            <Answer label="School / Institution">{application.school_institution}</Answer>
            <Answer label="Grade level / Occupation">{application.grade_or_occupation}</Answer>
            <Answer label="Woreda / Sub-city & City">{application.woreda_subcity_city}</Answer>
            <Answer label="Phone">
              <a href={`tel:${application.phone}`} className="underline underline-offset-2">
                {application.phone}
              </a>
            </Answer>
            <Answer label="Email">
              {application.email ? (
                <a href={`mailto:${application.email}`} className="underline underline-offset-2">
                  {application.email}
                </a>
              ) : null}
            </Answer>
            <Answer label="Supporting agency">{application.support_agency}</Answer>
            <Answer label="Parent / guardian">
              {`${application.parent_guardian_name} · ${application.parent_guardian_phone}`}
            </Answer>
            <Answer label="Guardian consent">
              {application.parent_guardian_consent
                ? `Given ${formatDateTime(application.parent_guardian_consent_at)}`
                : "Not given"}
            </Answer>
          </Panel>

          <Panel title="2. Motivation for Joining">
            <Answer label="2.1 Why the structure wants to join">
              {application.motivation_why}
            </Answer>
            <Answer label="Brief profile of the structure">{application.structure_profile}</Answer>
            <Answer label="2.2 What they hope to learn, contribute or achieve">
              {application.motivation_hopes}
            </Answer>
          </Panel>

          <Panel title="3. Understanding of Children's Rights">
            <Answer label="3.1 What children's rights means to them">
              {application.rights_meaning}
            </Answer>
            <Answer label="3.2 Familiar with the UNCRC">
              {application.uncrc_familiar ? "Yes" : "Not yet"}
            </Answer>
            {application.uncrc_familiar ? (
              <Answer label="3.2 Rights that matter most">{application.uncrc_rights}</Answer>
            ) : null}
            <Answer label="3.3 Rights most at risk locally">{application.rights_at_risk}</Answer>
            <Answer label="3.4 A situation witnessed or heard about">
              {application.rights_violation_witnessed}
            </Answer>
            <Answer label="3.5 Why child-led advocacy matters">{application.why_child_led}</Answer>
          </Panel>

          <Panel title="4. Experience & Involvement">
            <Answer label="4.1 Previous involvement">{application.prior_involvement}</Answer>
            <Answer label="4.2 Skills and strengths">{application.skills_strengths}</Answer>
            <Answer label="Recommenders">
              {application.recommenders?.length ? (
                <ul className="grid gap-2">
                  {application.recommenders.map((recommender, index) => (
                    <li key={index}>
                      <span className="font-medium">{recommender.name}</span>
                      {recommender.email ? (
                        <>
                          {" · "}
                          <a
                            href={`mailto:${recommender.email}`}
                            className="underline underline-offset-2"
                          >
                            {recommender.email}
                          </a>
                        </>
                      ) : null}
                      {recommender.phone ? ` · ${recommender.phone}` : ""}
                      {recommender.address ? ` · ${recommender.address}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Answer>
            <Answer label="Recommendation letter">
              <a
                href={`/api/admin/letter/${application.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
              >
                Download {application.recommendation_letter_name ?? "letter"}
              </a>
            </Answer>
          </Panel>

          <Panel title="5. Commitment & Safeguarding">
            <Answer label="5.1 Time per month">
              {timeCommitmentLabel(application.time_commitment)}
            </Answer>
            <Answer label="5.2 Willing to attend orientation, trainings and meetings">
              {meetingLabel(application.attends_meetings)}
            </Answer>
            {application.attends_meetings === "depends" ? (
              <Answer label="5.2 Availability depends on">
                {application.attends_meetings_note}
              </Answer>
            ) : null}
            <Answer label="5.3 Child safeguarding policy">
              {application.safeguarding_agreed ? "Agreed" : "Not agreed"}
            </Answer>
            <Answer label="Policy text shown to the applicant">{SAFEGUARDING_TEXT}</Answer>
          </Panel>

          <Panel title="6. Declaration">
            <Answer label="Declaration text">{DECLARATION_TEXT}</Answer>
            <Answer label="Confirmed">{application.declaration_agreed ? "Yes" : "No"}</Answer>
            <Answer label="Signature">{application.applicant_signature}</Answer>
            <Answer label="Date">{formatDate(application.declaration_date)}</Answer>
          </Panel>
        </div>

        <aside className="no-print lg:sticky lg:top-6">
          <div className="rounded-xl border border-ink-200 bg-white p-5">
            <h2 className="text-base font-bold text-ink-900">For ACLIC office use only</h2>
            {application.reviewed_at ? (
              <p className="mt-1 text-sm text-ink-500">
                Last reviewed {formatDateTime(application.reviewed_at)}
                {application.reviewed_by ? ` by ${application.reviewed_by}` : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-500">Not reviewed yet.</p>
            )}

            <div className="mt-4">
              <ReviewForm
                id={application.id}
                status={application.status}
                notes={application.reviewer_notes ?? ""}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
