"use client";

import { TextArea } from "@/components/ui/Fields";
import type { StepProps } from "../types";

export function MotivationStep({ values, setField, errors }: StepProps) {
  return (
    <div className="grid gap-6">
      <TextArea
        label="2.1  Why does your structure want to join as a member of ACLIC?"
        value={values.motivationWhy}
        onChange={(v) => setField("motivationWhy", v)}
        error={errors.motivationWhy}
        required
        rows={6}
        placeholder="Write in your own words…"
      />

      <TextArea
        label="Brief profile of the structure"
        value={values.structureProfile}
        onChange={(v) => setField("structureProfile", v)}
        error={errors.structureProfile}
        rows={5}
        hint="Optional. When was it formed, what does it do, who takes part?"
      />

      <TextArea
        label="2.2  What do you hope to learn, contribute, or achieve through this membership?"
        value={values.motivationHopes}
        onChange={(v) => setField("motivationHopes", v)}
        error={errors.motivationHopes}
        required
        rows={6}
      />
    </div>
  );
}
