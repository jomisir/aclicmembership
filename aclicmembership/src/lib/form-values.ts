import { DRAFT_KEY } from "./constants";
import type { Recommender, UploadedFile } from "./form-schema";

/**
 * The shape held in React state. Everything the user types is a string —
 * `applicationSchema` is responsible for coercing and validating it.
 */
export interface FormValues {
  // Section 1
  structureName: string;
  leadChildFullName: string;
  age: string;
  gender: string;
  membersFemale: string;
  membersMale: string;
  schoolInstitution: string;
  gradeOrOccupation: string;
  woredaSubcityCity: string;
  phone: string;
  email: string;
  supportAgency: string;
  parentGuardianName: string;
  parentGuardianPhone: string;
  parentGuardianConsent: boolean;

  // Section 2
  motivationWhy: string;
  structureProfile: string;
  motivationHopes: string;

  // Section 3
  rightsMeaning: string;
  uncrcFamiliar: string;
  uncrcRights: string;
  rightsAtRisk: string;
  rightsViolationWitnessed: string;
  whyChildLed: string;

  // Section 4
  priorInvolvement: string;
  skillsStrengths: string;
  recommenders: Recommender[];
  recommendationLetter: UploadedFile | null;

  // Section 5
  timeCommitment: string;
  attendsMeetings: string;
  attendsMeetingsNote: string;
  safeguardingAgreed: string;

  // Section 6
  declarationAgreed: boolean;
  applicantSignature: string;
  declarationDate: string;

  website: string; // honeypot
}

export const emptyRecommender = (): Recommender => ({
  name: "",
  email: "",
  phone: "",
  address: "",
});

export function todayIso(): string {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  return new Date(now.getTime() - offsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function initialValues(): FormValues {
  return {
    structureName: "",
    leadChildFullName: "",
    age: "",
    gender: "",
    membersFemale: "",
    membersMale: "",
    schoolInstitution: "",
    gradeOrOccupation: "",
    woredaSubcityCity: "",
    phone: "",
    email: "",
    supportAgency: "",
    parentGuardianName: "",
    parentGuardianPhone: "",
    parentGuardianConsent: false,

    motivationWhy: "",
    structureProfile: "",
    motivationHopes: "",

    rightsMeaning: "",
    uncrcFamiliar: "",
    uncrcRights: "",
    rightsAtRisk: "",
    rightsViolationWitnessed: "",
    whyChildLed: "",

    priorInvolvement: "",
    skillsStrengths: "",
    recommenders: [emptyRecommender(), emptyRecommender()],
    recommendationLetter: null,

    timeCommitment: "",
    attendsMeetings: "",
    attendsMeetingsNote: "",
    safeguardingAgreed: "",

    declarationAgreed: false,
    applicantSignature: "",
    declarationDate: todayIso(),

    website: "",
  };
}

/**
 * Merge a persisted draft over the empty defaults, keeping only keys we
 * still recognise. Guards against a stale draft from an older version of
 * the form re-introducing fields that no longer exist.
 */
export function mergeDraft(draft: unknown): FormValues {
  const base = initialValues();
  if (!draft || typeof draft !== "object") return base;

  const incoming = draft as Partial<Record<keyof FormValues, unknown>>;
  const merged = { ...base };

  for (const key of Object.keys(base) as (keyof FormValues)[]) {
    const value = incoming[key];
    if (value === undefined || value === null) continue;

    if (key === "recommenders") {
      if (Array.isArray(value)) {
        merged.recommenders = value.slice(0, 4).map((entry) => ({
          ...emptyRecommender(),
          ...(typeof entry === "object" && entry ? entry : {}),
        }));
      }
      continue;
    }

    if (key === "recommendationLetter") {
      if (typeof value === "object") merged.recommendationLetter = value as never;
      continue;
    }

    if (typeof base[key] === "boolean") {
      if (typeof value === "boolean") merged[key] = value as never;
      continue;
    }

    if (typeof value === "string") merged[key] = value as never;
  }

  // Never restore the honeypot from a draft.
  merged.website = "";
  return merged;
}

/**
 * Read the saved draft. Browser-only — call it from a `useState`
 * initializer inside a client-only subtree, never during SSR.
 */
export function readDraft(): { values: FormValues; restored: boolean } {
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (stored) return { values: mergeDraft(JSON.parse(stored)), restored: true };
  } catch {
    // Corrupt draft, or storage blocked in private mode — start fresh.
  }
  return { values: initialValues(), restored: false };
}
