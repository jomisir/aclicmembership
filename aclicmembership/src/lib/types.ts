import type { Recommender } from "./form-schema";

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "follow_up"
  | "rejected";

/** A row of `public.applications`. */
export interface ApplicationRow {
  id: string;
  created_at: string;
  updated_at: string;
  reference_code: string;

  structure_name: string;
  lead_child_full_name: string;
  age: number;
  gender: string;
  members_female: number;
  members_male: number;
  members_total: number;
  school_institution: string | null;
  grade_or_occupation: string | null;
  woreda_subcity_city: string;
  phone: string;
  email: string | null;
  support_agency: string | null;
  parent_guardian_name: string;
  parent_guardian_phone: string;
  parent_guardian_consent: boolean;
  parent_guardian_consent_at: string | null;

  motivation_why: string;
  structure_profile: string | null;
  motivation_hopes: string;

  rights_meaning: string;
  uncrc_familiar: boolean;
  uncrc_rights: string | null;
  rights_at_risk: string;
  rights_violation_witnessed: string;
  why_child_led: string;

  prior_involvement: string | null;
  skills_strengths: string;
  recommenders: Recommender[];
  recommendation_letter_path: string;
  recommendation_letter_name: string | null;

  time_commitment: string;
  attends_meetings: "yes" | "no" | "depends";
  attends_meetings_note: string | null;
  safeguarding_agreed: boolean;

  declaration_agreed: boolean;
  applicant_signature: string;
  declaration_date: string;

  status: ApplicationStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

/** Trimmed shape used by the admin list view. */
export type ApplicationSummary = Pick<
  ApplicationRow,
  | "id"
  | "created_at"
  | "reference_code"
  | "structure_name"
  | "lead_child_full_name"
  | "age"
  | "gender"
  | "woreda_subcity_city"
  | "members_total"
  | "phone"
  | "email"
  | "status"
>;
