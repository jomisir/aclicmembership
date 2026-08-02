"use client";

import { RadioGroup, TextArea } from "@/components/ui/Fields";
import type { StepProps } from "../types";

export function RightsStep({ values, setField, errors }: StepProps) {
  return (
    <div className="grid gap-6">
      <TextArea
        label="3.1  In your own words, what does the term “children’s rights” mean to you?"
        value={values.rightsMeaning}
        onChange={(v) => setField("rightsMeaning", v)}
        error={errors.rightsMeaning}
        required
        rows={5}
      />

      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <RadioGroup
          label="3.2  Are you familiar with the UN Convention on the Rights of the Child (UNCRC)?"
          name="uncrcFamiliar"
          value={values.uncrcFamiliar}
          onChange={(v) => setField("uncrcFamiliar", v)}
          error={errors.uncrcFamiliar}
          required
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "Not yet" },
          ]}
        />
        {values.uncrcFamiliar === "yes" ? (
          <div className="mt-5">
            <TextArea
              label="Name one or two rights it protects that matter most to you"
              value={values.uncrcRights}
              onChange={(v) => setField("uncrcRights", v)}
              error={errors.uncrcRights}
              required
              rows={3}
              maxLength={2000}
            />
          </div>
        ) : null}
        {values.uncrcFamiliar === "no" ? (
          <p className="mt-4 rounded-lg bg-gold-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
            That is completely fine. Members learn about the UNCRC during orientation — this
            question does not count against your application.
          </p>
        ) : null}
      </div>

      <TextArea
        label="3.3  Which children’s rights are most at risk in your community, and why?"
        value={values.rightsAtRisk}
        onChange={(v) => setField("rightsAtRisk", v)}
        error={errors.rightsAtRisk}
        required
        rows={5}
        hint="For example: education, protection from abuse, health, participation, freedom of expression."
      />

      <TextArea
        label="3.4  Can you describe a situation you have witnessed or heard about where a child’s rights were not respected? How did it affect you?"
        value={values.rightsViolationWitnessed}
        onChange={(v) => setField("rightsViolationWitnessed", v)}
        error={errors.rightsViolationWitnessed}
        required
        rows={6}
        hint="Please do not include the real names of any children involved."
      />

      <TextArea
        label="3.5  Why do you think it matters for children and young people themselves to lead advocacy on children’s rights, rather than adults alone?"
        value={values.whyChildLed}
        onChange={(v) => setField("whyChildLed", v)}
        error={errors.whyChildLed}
        required
        rows={5}
      />
    </div>
  );
}
