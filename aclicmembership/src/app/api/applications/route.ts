import { NextResponse } from "next/server";
import { validateAll, type ApplicationData } from "@/lib/form-schema";
import { LETTERS_BUCKET } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Only paths this app minted in /api/upload-url are acceptable. */
const LETTER_PATH_RE =
  /^applications\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/;

function toRow(data: ApplicationData) {
  const now = new Date().toISOString();

  return {
    // Section 1
    structure_name: data.structureName,
    lead_child_full_name: data.leadChildFullName,
    age: data.age,
    gender: data.gender,
    members_female: data.membersFemale,
    members_male: data.membersMale,
    school_institution: data.schoolInstitution || null,
    grade_or_occupation: data.gradeOrOccupation || null,
    woreda_subcity_city: data.woredaSubcityCity,
    phone: data.phone,
    email: data.email || null,
    support_agency: data.supportAgency || null,
    parent_guardian_name: data.parentGuardianName,
    parent_guardian_phone: data.parentGuardianPhone,
    parent_guardian_consent: data.parentGuardianConsent,
    parent_guardian_consent_at: now,

    // Section 2
    motivation_why: data.motivationWhy,
    structure_profile: data.structureProfile || null,
    motivation_hopes: data.motivationHopes,

    // Section 3
    rights_meaning: data.rightsMeaning,
    uncrc_familiar: data.uncrcFamiliar === "yes",
    uncrc_rights: data.uncrcFamiliar === "yes" ? data.uncrcRights || null : null,
    rights_at_risk: data.rightsAtRisk,
    rights_violation_witnessed: data.rightsViolationWitnessed,
    why_child_led: data.whyChildLed,

    // Section 4
    prior_involvement: data.priorInvolvement || null,
    skills_strengths: data.skillsStrengths,
    recommenders: data.recommenders,
    recommendation_letter_path: data.recommendationLetter!.path,
    recommendation_letter_name: data.recommendationLetter!.name,

    // Section 5
    time_commitment: data.timeCommitment,
    attends_meetings: data.attendsMeetings,
    attends_meetings_note:
      data.attendsMeetings === "depends" ? data.attendsMeetingsNote || null : null,
    safeguarding_agreed: data.safeguardingAgreed === "yes",

    // Section 6
    declaration_agreed: data.declarationAgreed,
    applicant_signature: data.applicantSignature,
    declaration_date: data.declarationDate,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateAll(body);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Some answers need attention before we can accept this application.",
        fieldErrors: validation.errors,
      },
      { status: 422 },
    );
  }

  const data = validation.data;

  // Silently accept-and-discard obvious bot submissions.
  if (data.website) {
    return NextResponse.json({ referenceCode: "" }, { status: 200 });
  }

  const letterPath = data.recommendationLetter?.path ?? "";
  if (!LETTER_PATH_RE.test(letterPath)) {
    return NextResponse.json(
      {
        error: "The recommendation letter could not be verified. Please upload it again.",
        fieldErrors: { recommendationLetter: "Please upload the letter again." },
      },
      { status: 422 },
    );
  }

  try {
    const supabase = createAdminClient();

    // Confirm the file really landed in storage — a client could otherwise
    // post a well-formed path for a file that was never uploaded.
    const { error: letterError } = await supabase.storage
      .from(LETTERS_BUCKET)
      .createSignedUrl(letterPath, 60);

    if (letterError) {
      return NextResponse.json(
        {
          error: "We could not find your uploaded recommendation letter. Please upload it again.",
          fieldErrors: { recommendationLetter: "Please upload the letter again." },
        },
        { status: 422 },
      );
    }

    const { data: inserted, error } = await supabase
      .from("applications")
      .insert(toRow(data))
      .select("reference_code")
      .single();

    if (error || !inserted) {
      console.error("application insert failed", error);
      return NextResponse.json(
        { error: "We could not save your application. Please try again in a moment." },
        { status: 502 },
      );
    }

    return NextResponse.json({ referenceCode: inserted.reference_code }, { status: 201 });
  } catch (cause) {
    console.error("applications route failed", cause);
    return NextResponse.json(
      { error: "The application service is unavailable. Please try again shortly." },
      { status: 500 },
    );
  }
}
