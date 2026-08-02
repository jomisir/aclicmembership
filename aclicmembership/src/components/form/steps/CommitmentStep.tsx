"use client";

import { RadioGroup, TextArea } from "@/components/ui/Fields";
import { MEETING_OPTIONS, SAFEGUARDING_TEXT, TIME_COMMITMENT_OPTIONS } from "@/lib/form-schema";
import type { StepProps } from "../types";

export function CommitmentStep({ values, setField, errors }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <RadioGroup
          label="5.1  How much time can you realistically commit to ACLIC activities each month?"
          name="timeCommitment"
          value={values.timeCommitment}
          onChange={(v) => setField("timeCommitment", v)}
          error={errors.timeCommitment}
          required
          hint="Be honest — a smaller commitment you can keep is more useful to us than a large one you cannot."
          options={TIME_COMMITMENT_OPTIONS}
        />
      </div>

      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <RadioGroup
          label="5.2  Are you willing to attend orientation, trainings, and regular coalition meetings?"
          name="attendsMeetings"
          value={values.attendsMeetings}
          onChange={(v) => setField("attendsMeetings", v)}
          error={errors.attendsMeetings}
          required
          options={MEETING_OPTIONS}
        />
        {values.attendsMeetings === "depends" ? (
          <div className="mt-5">
            <TextArea
              label="What does your availability depend on?"
              value={values.attendsMeetingsNote}
              onChange={(v) => setField("attendsMeetingsNote", v)}
              error={errors.attendsMeetingsNote}
              required
              rows={3}
              maxLength={1000}
              hint="For example school hours, exam periods, travel time."
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-5">
        <h3 className="text-[15px] font-bold text-ink-900">5.3  Child safeguarding policy</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{SAFEGUARDING_TEXT}</p>
        <div className="mt-4">
          <RadioGroup
            label="Do you agree to abide by this policy?"
            name="safeguardingAgreed"
            value={values.safeguardingAgreed}
            onChange={(v) => setField("safeguardingAgreed", v)}
            error={errors.safeguardingAgreed}
            required
            options={[
              { value: "yes", label: "Yes, I agree" },
              { value: "no", label: "No" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
