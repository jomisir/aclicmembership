"use client";

import { TextArea, TextInput } from "@/components/ui/Fields";
import { emptyRecommender } from "@/lib/form-values";
import type { Recommender } from "@/lib/form-schema";
import { FileUpload } from "../FileUpload";
import type { StepProps } from "../types";

interface ExperienceStepProps extends StepProps {
  onUploadingChange?: (uploading: boolean) => void;
}

export function ExperienceStep({
  values,
  setField,
  errors,
  onUploadingChange,
}: ExperienceStepProps) {
  const updateRecommender = (index: number, patch: Partial<Recommender>) => {
    const next = values.recommenders.map((recommender, i) =>
      i === index ? { ...recommender, ...patch } : recommender,
    );
    setField("recommenders", next);
  };

  const addRecommender = () => {
    if (values.recommenders.length >= 4) return;
    setField("recommenders", [...values.recommenders, emptyRecommender()]);
  };

  const removeRecommender = (index: number) => {
    setField(
      "recommenders",
      values.recommenders.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="grid gap-6">
      <TextArea
        label="4.1  Have you previously been involved in any child rights advocacy, community service, or club activities?"
        value={values.priorInvolvement}
        onChange={(v) => setField("priorInvolvement", v)}
        error={errors.priorInvolvement}
        rows={5}
        hint="For example MUN, school clubs, volunteering. Optional — leave blank if this would be your first."
      />

      <TextArea
        label="4.2  What skills or strengths would you bring to ACLIC?"
        value={values.skillsStrengths}
        onChange={(v) => setField("skillsStrengths", v)}
        error={errors.skillsStrengths}
        required
        rows={5}
        hint="For example public speaking, writing, research, organising events, design, social media, translation."
      />

      <fieldset className="rounded-xl border border-ink-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink-800">
          Recommender contacts
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        </legend>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          At least one is required. We may contact them about your application.
        </p>

        {errors.recommenders ? (
          <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
            {errors.recommenders}
          </p>
        ) : null}

        <div className="mt-4 grid gap-5">
          {values.recommenders.map((recommender, index) => (
            <div key={index} className="rounded-lg border border-ink-100 bg-ink-50/60 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-ink-700">
                  Recommender {index + 1}
                  {index === 0 ? (
                    <span className="ml-1 text-rose-600" aria-hidden="true">
                      *
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-normal text-ink-400">optional</span>
                  )}
                </h4>
                {values.recommenders.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeRecommender(index)}
                    className="text-sm font-medium text-ink-500 underline-offset-2 hover:text-rose-700 hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Name"
                  value={recommender.name}
                  onChange={(v) => updateRecommender(index, { name: v })}
                  error={errors[`recommenders.${index}.name`]}
                  required={index === 0}
                />
                <TextInput
                  label="Email"
                  type="email"
                  inputMode="email"
                  value={recommender.email}
                  onChange={(v) => updateRecommender(index, { email: v })}
                  error={errors[`recommenders.${index}.email`]}
                  required={index === 0}
                />
                <TextInput
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  value={recommender.phone}
                  onChange={(v) => updateRecommender(index, { phone: v })}
                  error={errors[`recommenders.${index}.phone`]}
                />
                <TextInput
                  label="Address"
                  value={recommender.address}
                  onChange={(v) => updateRecommender(index, { address: v })}
                  error={errors[`recommenders.${index}.address`]}
                />
              </div>
            </div>
          ))}
        </div>

        {values.recommenders.length < 4 ? (
          <button
            type="button"
            onClick={addRecommender}
            className="mt-4 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50"
          >
            + Add another recommender
          </button>
        ) : null}
      </fieldset>

      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <FileUpload
          value={values.recommendationLetter}
          onChange={(file) => setField("recommendationLetter", file)}
          error={errors.recommendationLetter}
          onUploadingChange={onUploadingChange}
        />
      </div>
    </div>
  );
}
