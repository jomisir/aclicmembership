"use client";

import { Checkbox, TextInput } from "@/components/ui/Fields";
import { DECLARATION_TEXT } from "@/lib/form-schema";
import type { StepProps } from "../types";

export function DeclarationStep({ values, setField, errors }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <p className="text-[15px] leading-relaxed text-ink-800">{DECLARATION_TEXT}</p>
      </div>

      <Checkbox
        checked={values.declarationAgreed}
        onChange={(v) => setField("declarationAgreed", v)}
        error={errors.declarationAgreed}
        label={<strong className="font-semibold">I confirm the declaration above.</strong>}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextInput
          label="Signature — type your full name"
          value={values.applicantSignature}
          onChange={(v) => setField("applicantSignature", v)}
          error={errors.applicantSignature}
          required
          hint="Typing your name here counts as your signature."
        />
        <TextInput
          label="Date"
          type="date"
          value={values.declarationDate}
          onChange={(v) => setField("declarationDate", v)}
          error={errors.declarationDate}
          required
        />
      </div>

      <p className="rounded-lg bg-ink-100 px-4 py-3 text-sm leading-relaxed text-ink-600">
        Parent or guardian consent is required for every applicant under 18. You gave it in step 1
        of this form — you do not need a separate signature.
      </p>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setField("website", event.target.value)}
        />
      </div>
    </div>
  );
}
