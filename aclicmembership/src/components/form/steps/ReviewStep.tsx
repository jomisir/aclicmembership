"use client";

import type { ReactNode } from "react";
import { meetingLabel, timeCommitmentLabel, formatBytes, formatDate } from "@/lib/labels";
import type { FormValues } from "@/lib/form-values";
import type { StepId } from "@/lib/form-schema";

function Row({ label, children }: { label: string; children: ReactNode }) {
  const empty =
    children === null ||
    children === undefined ||
    children === "" ||
    (typeof children === "string" && children.trim() === "");

  return (
    <div className="grid gap-1 border-b border-ink-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-ink-500">{label}</dt>
      <dd
        className={`text-[15px] whitespace-pre-line ${empty ? "text-ink-400 italic" : "text-ink-900"}`}
      >
        {empty ? "Not provided" : children}
      </dd>
    </div>
  );
}

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: StepId;
  onEdit: (step: StepId) => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-bold text-ink-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="shrink-0 rounded-md border border-ink-300 px-3 py-1.5 text-sm font-semibold text-ink-700 transition hover:border-ink-400 hover:bg-ink-50"
        >
          Edit
        </button>
      </div>
      <dl className="mt-3">{children}</dl>
    </section>
  );
}

export function ReviewStep({
  values,
  onEdit,
}: {
  values: FormValues;
  onEdit: (step: StepId) => void;
}) {
  const female = Number(values.membersFemale) || 0;
  const male = Number(values.membersMale) || 0;
  const filledRecommenders = values.recommenders.filter(
    (recommender) => recommender.name.trim() || recommender.email.trim(),
  );

  return (
    <div className="grid gap-5">
      <Section title="1. Personal Information" step="personal" onEdit={onEdit}>
        <Row label="Structure name">{values.structureName}</Row>
        <Row label="Child leading the structure">{values.leadChildFullName}</Row>
        <Row label="Age">{values.age}</Row>
        <Row label="Gender">{values.gender}</Row>
        <Row label="Active members">{`F = ${female} · M = ${male} · Total = ${female + male}`}</Row>
        <Row label="School / Institution">{values.schoolInstitution}</Row>
        <Row label="Grade / Occupation">{values.gradeOrOccupation}</Row>
        <Row label="Woreda / Sub-city & City">{values.woredaSubcityCity}</Row>
        <Row label="Phone">{values.phone}</Row>
        <Row label="Email">{values.email}</Row>
        <Row label="Supporting agency">{values.supportAgency}</Row>
        <Row label="Parent / guardian">
          {values.parentGuardianName
            ? `${values.parentGuardianName} · ${values.parentGuardianPhone}`
            : ""}
        </Row>
        <Row label="Guardian consent">{values.parentGuardianConsent ? "Given" : "Not given"}</Row>
      </Section>

      <Section title="2. Motivation for Joining" step="motivation" onEdit={onEdit}>
        <Row label="Why join ACLIC">{values.motivationWhy}</Row>
        <Row label="Structure profile">{values.structureProfile}</Row>
        <Row label="Hopes for the membership">{values.motivationHopes}</Row>
      </Section>

      <Section title="3. Understanding of Children's Rights" step="rights" onEdit={onEdit}>
        <Row label="What children's rights means">{values.rightsMeaning}</Row>
        <Row label="Familiar with the UNCRC">
          {values.uncrcFamiliar === "yes" ? "Yes" : values.uncrcFamiliar === "no" ? "Not yet" : ""}
        </Row>
        {values.uncrcFamiliar === "yes" ? (
          <Row label="Rights that matter most">{values.uncrcRights}</Row>
        ) : null}
        <Row label="Rights most at risk">{values.rightsAtRisk}</Row>
        <Row label="A situation witnessed">{values.rightsViolationWitnessed}</Row>
        <Row label="Why child-led advocacy">{values.whyChildLed}</Row>
      </Section>

      <Section title="4. Experience & Involvement" step="experience" onEdit={onEdit}>
        <Row label="Previous involvement">{values.priorInvolvement}</Row>
        <Row label="Skills and strengths">{values.skillsStrengths}</Row>
        <Row label="Recommenders">
          {filledRecommenders.length ? (
            <ul className="grid gap-1">
              {filledRecommenders.map((recommender, index) => (
                <li key={index}>
                  {recommender.name}
                  {recommender.email ? ` · ${recommender.email}` : ""}
                  {recommender.phone ? ` · ${recommender.phone}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            ""
          )}
        </Row>
        <Row label="Recommendation letter">
          {values.recommendationLetter
            ? `${values.recommendationLetter.name} (${formatBytes(values.recommendationLetter.size)})`
            : ""}
        </Row>
      </Section>

      <Section title="5. Commitment & Safeguarding" step="commitment" onEdit={onEdit}>
        <Row label="Monthly time commitment">
          {values.timeCommitment ? timeCommitmentLabel(values.timeCommitment) : ""}
        </Row>
        <Row label="Attend orientation & meetings">
          {values.attendsMeetings ? meetingLabel(values.attendsMeetings) : ""}
        </Row>
        {values.attendsMeetings === "depends" ? (
          <Row label="Availability depends on">{values.attendsMeetingsNote}</Row>
        ) : null}
        <Row label="Safeguarding policy">
          {values.safeguardingAgreed === "yes"
            ? "Agreed"
            : values.safeguardingAgreed === "no"
              ? "Not agreed"
              : ""}
        </Row>
      </Section>

      <Section title="6. Declaration" step="declaration" onEdit={onEdit}>
        <Row label="Declaration confirmed">{values.declarationAgreed ? "Yes" : "No"}</Row>
        <Row label="Signature">{values.applicantSignature}</Row>
        <Row label="Date">{values.declarationDate ? formatDate(values.declarationDate) : ""}</Row>
      </Section>
    </div>
  );
}
