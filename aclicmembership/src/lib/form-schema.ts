import { z } from "zod";

/**
 * Single source of truth for the ACLIC membership application.
 *
 * The same schema validates in the browser (per step, as the applicant
 * moves through the wizard) and again on the server before anything is
 * written to Supabase — a client can never talk the API into accepting
 * an application the form itself would have rejected.
 */

// ---------------------------------------------------------------------
// Option lists (mirroring the paper form)
// ---------------------------------------------------------------------

export const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"] as const;

export const TIME_COMMITMENT_OPTIONS = [
  { value: "lt_2_hours", label: "Less than 2 hours" },
  { value: "2_to_5_hours", label: "2–5 hours" },
  { value: "5_to_10_hours", label: "5–10 hours" },
  { value: "gt_10_hours", label: "More than 10 hours" },
] as const;

export const MEETING_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "depends", label: "Depends on my schedule" },
] as const;

export const MIN_AGE = 12;
export const MAX_AGE = 17;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB — matches the storage bucket limit

export const ACCEPTED_UPLOAD_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const SAFEGUARDING_TEXT =
  "ACLIC follows a child safeguarding policy that requires all members to treat fellow children with respect, protect their privacy, and report any concerns about a child's safety to a designated focal point.";

export const DECLARATION_TEXT =
  "I confirm that the information provided in this application is true and accurate to the best of my knowledge. I understand that ACLIC membership is voluntary and rooted in a shared commitment to promoting and protecting children's rights, and I agree to act in line with the coalition's values and code of conduct.";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

/** Loose international/Ethiopian phone check — digits, spaces, dashes, parens. */
const PHONE_RE = /^\+?[\d][\d\s\-()]{7,19}$/;

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(PHONE_RE, `Enter a valid ${label.toLowerCase()} (for example +251 91 234 5678).`);

const longAnswer = (label: string, min = 20) =>
  z
    .string()
    .trim()
    .min(min, `Please answer this question — at least ${min} characters. (${label})`)
    .max(4000, "Please keep this answer under 4000 characters.");

const optionalText = (max = 2000) => z.string().trim().max(max).default("");

/**
 * Number inputs hand us strings, and an empty one must read as "missing"
 * rather than silently coercing to 0 — otherwise a blank age field would
 * fail with a confusing out-of-range message instead of "this is required".
 */
const numberFromInput = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return typeof value === "string" ? Number(value) : value;
  }, schema);

// ---------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------

export const recommenderSchema = z.object({
  name: z.string().trim().min(2, "Recommender name is required."),
  email: z.email("Enter a valid email address for this recommender."),
  phone: z.string().trim().max(30).default(""),
  address: z.string().trim().max(300).default(""),
});

export type Recommender = z.infer<typeof recommenderSchema>;

export const uploadedFileSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  type: z.string().min(1),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

const isBlankRecommender = (value: unknown) =>
  !value ||
  typeof value !== "object" ||
  Object.values(value as Record<string, unknown>).every(
    (field) => String(field ?? "").trim() === "",
  );

// ---------------------------------------------------------------------
// The application schema
//
// Two things to know about how this is put together:
//
//  * Requirements that concern a single field (must be ticked, must be
//    chosen) are expressed on that field, not in a whole-object refinement.
//    Zod skips object-level refinements whenever any field fails, so a rule
//    written up there would go unchecked while the rest of the form is
//    still blank — exactly the situation per-step validation runs in.
//
//  * The handful of genuinely cross-field rules live in refiners grouped by
//    the step that owns them, so a step can be validated on its own.
// ---------------------------------------------------------------------

const applicationFields = {
  // --- Section 1: Personal Information -----------------------------
  structureName: z
    .string()
    .trim()
    .min(2, "Tell us the name of the structure applying for membership.")
    .max(200),
  leadChildFullName: z
    .string()
    .trim()
    .min(2, "Full name of the child leading the structure is required.")
    .max(200),
  age: numberFromInput(
    z
      .number({ error: "Enter the age of the child leading the structure." })
      .int("Age must be a whole number.")
      .min(MIN_AGE, `ACLIC members must be between ${MIN_AGE} and ${MAX_AGE} years old.`)
      .max(MAX_AGE, `ACLIC members must be between ${MIN_AGE} and ${MAX_AGE} years old.`),
  ),
  gender: z.enum(GENDER_OPTIONS, { error: "Select an option." }),
  membersFemale: numberFromInput(
    z
      .number({ error: "Enter a number (use 0 if there are none)." })
      .int("Enter a whole number.")
      .min(0, "This cannot be negative.")
      .max(10000, "That looks too high — please check."),
  ),
  membersMale: numberFromInput(
    z
      .number({ error: "Enter a number (use 0 if there are none)." })
      .int("Enter a whole number.")
      .min(0, "This cannot be negative.")
      .max(10000, "That looks too high — please check."),
  ),
  schoolInstitution: optionalText(200),
  gradeOrOccupation: optionalText(200),
  woredaSubcityCity: z.string().trim().min(2, "Tell us your woreda / sub-city & city.").max(200),
  phone: phone("Phone number"),
  email: z.union([z.email("Enter a valid email address."), z.literal("")]).default(""),
  supportAgency: optionalText(500),
  parentGuardianName: z
    .string()
    .trim()
    .min(2, "A parent or guardian name is required for consent.")
    .max(200),
  parentGuardianPhone: phone("Parent/guardian phone"),
  parentGuardianConsent: z.literal(true, {
    error: "A parent or guardian must confirm consent before this application can be submitted.",
  }),

  // --- Section 2: Motivation for Joining ---------------------------
  motivationWhy: longAnswer("Why your structure wants to join"),
  structureProfile: optionalText(4000),
  motivationHopes: longAnswer("What you hope to learn, contribute or achieve"),

  // --- Section 3: Understanding of Children's Rights ---------------
  rightsMeaning: longAnswer("What children's rights means to you"),
  uncrcFamiliar: z.enum(["yes", "no"], { error: "Select yes or no." }),
  uncrcRights: optionalText(2000),
  rightsAtRisk: longAnswer("Rights most at risk in your community"),
  rightsViolationWitnessed: longAnswer("A situation where a child's rights were not respected"),
  whyChildLed: longAnswer("Why children should lead advocacy themselves"),

  // --- Section 4: Experience & Involvement -------------------------
  priorInvolvement: optionalText(4000),
  skillsStrengths: longAnswer("Skills or strengths you would bring", 10),
  recommenders: z.preprocess(
    (value) => (Array.isArray(value) ? value.filter((r) => !isBlankRecommender(r)) : value),
    z
      .array(recommenderSchema)
      .min(1, "At least one recommender is required.")
      .max(4, "You can list up to four recommenders."),
  ),
  recommendationLetter: uploadedFileSchema
    .nullish()
    .refine((value) => value != null, { error: "A recommendation letter is required." }),

  // --- Section 5: Commitment & Safeguarding ------------------------
  timeCommitment: z.enum(
    TIME_COMMITMENT_OPTIONS.map((option) => option.value) as [string, ...string[]],
    { error: "Choose how much time you can commit each month." },
  ),
  attendsMeetings: z.enum(["yes", "no", "depends"], { error: "Select an option." }),
  attendsMeetingsNote: optionalText(1000),
  safeguardingAgreed: z
    .enum(["yes", "no"], {
      error: "Let us know whether you agree to the child safeguarding policy.",
    })
    .refine((value) => value === "yes", {
      error:
        "Agreeing to the child safeguarding policy is required for ACLIC membership. If you have questions about the policy, contact ACLIC before applying.",
    }),

  // --- Section 6: Declaration --------------------------------------
  declarationAgreed: z.literal(true, {
    error: "You must confirm the declaration before submitting.",
  }),
  applicantSignature: z
    .string()
    .trim()
    .min(2, "Type your full name to sign this application.")
    .max(200),
  declarationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select the date you are signing this application."),

  // Spam trap — real applicants never see this field.
  website: z.string().max(0).default(""),
};

const applicationObject = z.object(applicationFields);

// --- Cross-field rules, grouped by the step that owns them -----------

type Refiner = (data: Record<string, unknown>, ctx: z.RefinementCtx) => void;

const refinePersonal: Refiner = (data, ctx) => {
  const female = Number(data.membersFemale ?? 0);
  const male = Number(data.membersMale ?? 0);
  if (female + male < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["membersMale"],
      message: "A structure needs at least one active member.",
    });
  }
};

const refineRights: Refiner = (data, ctx) => {
  if (data.uncrcFamiliar === "yes" && String(data.uncrcRights ?? "").trim().length < 5) {
    ctx.addIssue({
      code: "custom",
      path: ["uncrcRights"],
      message: "Name one or two rights the UNCRC protects that matter most to you.",
    });
  }
};

const refineCommitment: Refiner = (data, ctx) => {
  if (
    data.attendsMeetings === "depends" &&
    String(data.attendsMeetingsNote ?? "").trim().length < 5
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["attendsMeetingsNote"],
      message: "Please explain what your availability depends on.",
    });
  }
};

export const applicationSchema = applicationObject.superRefine((data, ctx) => {
  const record = data as unknown as Record<string, unknown>;
  refinePersonal(record, ctx);
  refineRights(record, ctx);
  refineCommitment(record, ctx);
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationData = z.output<typeof applicationSchema>;

// ---------------------------------------------------------------------
// Wizard steps — also drives per-step validation
// ---------------------------------------------------------------------

export type StepId =
  | "personal"
  | "motivation"
  | "rights"
  | "experience"
  | "commitment"
  | "declaration"
  | "review";

export interface Step {
  id: StepId;
  number: string;
  title: string;
  short: string;
  blurb?: string;
  fields: string[];
}

export const STEPS: Step[] = [
  {
    id: "personal",
    number: "1",
    title: "Personal Information",
    short: "Personal",
    blurb: "Tell us about your structure and how we can reach you.",
    fields: [
      "structureName",
      "leadChildFullName",
      "age",
      "gender",
      "membersFemale",
      "membersMale",
      "schoolInstitution",
      "gradeOrOccupation",
      "woredaSubcityCity",
      "phone",
      "email",
      "supportAgency",
      "parentGuardianName",
      "parentGuardianPhone",
      "parentGuardianConsent",
    ],
  },
  {
    id: "motivation",
    number: "2",
    title: "Motivation for Joining",
    short: "Motivation",
    blurb: "There are no right answers here — write in your own words.",
    fields: ["motivationWhy", "structureProfile", "motivationHopes"],
  },
  {
    id: "rights",
    number: "3",
    title: "Understanding of Children's Rights",
    short: "Rights",
    blurb:
      "We are not testing you. We ask so we can shape trainings around what members already know.",
    fields: [
      "rightsMeaning",
      "uncrcFamiliar",
      "uncrcRights",
      "rightsAtRisk",
      "rightsViolationWitnessed",
      "whyChildLed",
    ],
  },
  {
    id: "experience",
    number: "4",
    title: "Experience & Involvement",
    short: "Experience",
    blurb: "Previous experience is welcome but not required.",
    fields: [
      "priorInvolvement",
      "skillsStrengths",
      "recommenders",
      "recommendationLetter",
    ],
  },
  {
    id: "commitment",
    number: "5",
    title: "Commitment & Safeguarding",
    short: "Commitment",
    fields: [
      "timeCommitment",
      "attendsMeetings",
      "attendsMeetingsNote",
      "safeguardingAgreed",
    ],
  },
  {
    id: "declaration",
    number: "6",
    title: "Declaration",
    short: "Declaration",
    fields: ["declarationAgreed", "applicantSignature", "declarationDate", "website"],
  },
  {
    id: "review",
    number: "7",
    title: "Review & Submit",
    short: "Review",
    blurb: "Check your answers. You can go back and change anything before sending.",
    fields: [],
  },
];

// ---------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

/** Flatten Zod issues into `{ "recommenders.0.email": "message" }`. */
export function collectErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

/**
 * One schema per step, holding only that step's fields plus the cross-field
 * rules that belong to it. Validating a step in isolation is what makes
 * "Save and continue" catch conditional requirements while the rest of the
 * form is still empty.
 */
const STEP_REFINERS: Partial<Record<StepId, Refiner>> = {
  personal: refinePersonal,
  rights: refineRights,
  commitment: refineCommitment,
};

const STEP_SCHEMAS: Partial<Record<StepId, z.ZodType>> = Object.fromEntries(
  STEPS.filter((step) => step.fields.length > 0).map((step) => {
    const mask = Object.fromEntries(step.fields.map((field) => [field, true]));
    const picked = applicationObject.pick(mask as Parameters<typeof applicationObject.pick>[0]);
    const refiner = STEP_REFINERS[step.id];
    return [
      step.id,
      refiner
        ? picked.superRefine((data, ctx) => refiner(data as Record<string, unknown>, ctx))
        : picked,
    ];
  }),
);

/** Validate just the fields belonging to `stepId`. */
export function validateStep(values: unknown, stepId: StepId): FieldErrors {
  const schema = STEP_SCHEMAS[stepId];
  if (!schema) return {};

  const result = schema.safeParse(values);
  return result.success ? {} : collectErrors(result.error);
}

/**
 * Full-form validation for submit. Runs every step schema so the applicant
 * sees all outstanding problems at once, not one round-trip at a time.
 */
export function validateAll(values: unknown):
  | { ok: true; data: ApplicationData }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  for (const step of STEPS) {
    Object.assign(errors, validateStep(values, step.id));
  }

  const result = applicationSchema.safeParse(values);
  if (!result.success) Object.assign(errors, collectErrors(result.error));

  if (result.success && Object.keys(errors).length === 0) {
    return { ok: true, data: result.data };
  }
  return { ok: false, errors };
}

/** Which step should we jump to for a given set of field errors? */
export function firstStepWithError(errors: FieldErrors): StepId | null {
  const keys = Object.keys(errors).map((key) => key.split(".")[0]);
  for (const step of STEPS) {
    if (step.fields.some((field) => keys.includes(field))) return step.id;
  }
  return null;
}
