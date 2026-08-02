"use client";

import { Checkbox, TextInput, Select } from "@/components/ui/Fields";
import { GENDER_OPTIONS, MAX_AGE, MIN_AGE } from "@/lib/form-schema";
import type { StepProps } from "../types";

export function PersonalStep({ values, setField, errors }: StepProps) {
  const female = Number(values.membersFemale) || 0;
  const male = Number(values.membersMale) || 0;
  const total = female + male;

  return (
    <div className="grid gap-6">
      <TextInput
        label="Name of the structure applying for membership"
        value={values.structureName}
        onChange={(v) => setField("structureName", v)}
        error={errors.structureName}
        required
        placeholder="e.g. Bole Secondary School Child Rights Club"
      />

      <TextInput
        label="Full name of the child leading the structure"
        value={values.leadChildFullName}
        onChange={(v) => setField("leadChildFullName", v)}
        error={errors.leadChildFullName}
        required
        autoComplete="name"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextInput
          label="Age"
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          value={values.age}
          onChange={(v) => setField("age", v)}
          error={errors.age}
          required
          hint={`Members must be ${MIN_AGE}–${MAX_AGE} years old.`}
        />
        <Select
          label="Gender"
          value={values.gender}
          onChange={(v) => setField("gender", v)}
          options={GENDER_OPTIONS}
          error={errors.gender}
          required
        />
      </div>

      <fieldset className="rounded-xl border border-ink-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink-800">
          Number of active members in the structure
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <TextInput
            label="Female (F)"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.membersFemale}
            onChange={(v) => setField("membersFemale", v)}
            error={errors.membersFemale}
            required
          />
          <TextInput
            label="Male (M)"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.membersMale}
            onChange={(v) => setField("membersMale", v)}
            error={errors.membersMale}
            required
          />
          <div>
            <span className="block text-sm font-semibold text-ink-800">Total (T)</span>
            <p className="mt-1 text-sm text-ink-500">Calculated for you</p>
            <output className="mt-2 flex h-[46px] w-full items-center rounded-lg border border-ink-200 bg-ink-50 px-3.5 text-[15px] font-semibold text-ink-900">
              {total}
            </output>
          </div>
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextInput
          label="School / Institution"
          value={values.schoolInstitution}
          onChange={(v) => setField("schoolInstitution", v)}
          error={errors.schoolInstitution}
        />
        <TextInput
          label="Grade level / Occupation"
          value={values.gradeOrOccupation}
          onChange={(v) => setField("gradeOrOccupation", v)}
          error={errors.gradeOrOccupation}
          placeholder="e.g. Grade 10"
        />
      </div>

      <TextInput
        label="Woreda / Sub-city & City"
        value={values.woredaSubcityCity}
        onChange={(v) => setField("woredaSubcityCity", v)}
        error={errors.woredaSubcityCity}
        required
        placeholder="e.g. Woreda 03, Bole Sub-city, Addis Ababa"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextInput
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(v) => setField("phone", v)}
          error={errors.phone}
          required
          placeholder="+251 91 234 5678"
        />
        <TextInput
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(v) => setField("email", v)}
          error={errors.email}
          hint="We will use this to reply to your application."
        />
      </div>

      <TextInput
        label="Name and address of the agency supporting the structure"
        value={values.supportAgency}
        onChange={(v) => setField("supportAgency", v)}
        error={errors.supportAgency}
        hint="Leave blank if no agency supports your structure."
      />

      <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-5">
        <h3 className="text-[15px] font-bold text-ink-900">Parent or guardian consent</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
          Because ACLIC members are children, we need a parent or guardian contact and their
          consent before we can accept an application.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <TextInput
            label="Parent / guardian name"
            value={values.parentGuardianName}
            onChange={(v) => setField("parentGuardianName", v)}
            error={errors.parentGuardianName}
            required
          />
          <TextInput
            label="Parent / guardian phone"
            type="tel"
            inputMode="tel"
            value={values.parentGuardianPhone}
            onChange={(v) => setField("parentGuardianPhone", v)}
            error={errors.parentGuardianPhone}
            required
            placeholder="+251 91 234 5678"
          />
        </div>
        <div className="mt-5">
          <Checkbox
            checked={values.parentGuardianConsent}
            onChange={(v) => setField("parentGuardianConsent", v)}
            error={errors.parentGuardianConsent}
            label={
              <>
                <strong className="font-semibold">
                  My parent or guardian has read this application and consents to it.
                </strong>{" "}
                They agree to be contacted by ACLIC about my membership. Ticking this box takes the
                place of their signature on the paper form.
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}
