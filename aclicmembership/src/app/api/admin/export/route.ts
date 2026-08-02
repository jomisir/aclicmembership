import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { meetingLabel, STATUS_LABELS, timeCommitmentLabel } from "@/lib/labels";
import type { ApplicationRow } from "@/lib/types";

export const runtime = "nodejs";

const COLUMNS: { header: string; value: (row: ApplicationRow) => string }[] = [
  { header: "Reference", value: (r) => r.reference_code },
  { header: "Submitted", value: (r) => r.created_at },
  { header: "Status", value: (r) => STATUS_LABELS[r.status] ?? r.status },
  { header: "Structure", value: (r) => r.structure_name },
  { header: "Child leading", value: (r) => r.lead_child_full_name },
  { header: "Age", value: (r) => String(r.age) },
  { header: "Gender", value: (r) => r.gender },
  { header: "Members F", value: (r) => String(r.members_female) },
  { header: "Members M", value: (r) => String(r.members_male) },
  { header: "Members total", value: (r) => String(r.members_total) },
  { header: "School / Institution", value: (r) => r.school_institution ?? "" },
  { header: "Grade / Occupation", value: (r) => r.grade_or_occupation ?? "" },
  { header: "Woreda / Sub-city & City", value: (r) => r.woreda_subcity_city },
  { header: "Phone", value: (r) => r.phone },
  { header: "Email", value: (r) => r.email ?? "" },
  { header: "Supporting agency", value: (r) => r.support_agency ?? "" },
  { header: "Guardian name", value: (r) => r.parent_guardian_name },
  { header: "Guardian phone", value: (r) => r.parent_guardian_phone },
  { header: "Guardian consent", value: (r) => (r.parent_guardian_consent ? "Yes" : "No") },
  { header: "2.1 Why join", value: (r) => r.motivation_why },
  { header: "Structure profile", value: (r) => r.structure_profile ?? "" },
  { header: "2.2 Hopes", value: (r) => r.motivation_hopes },
  { header: "3.1 Rights meaning", value: (r) => r.rights_meaning },
  { header: "3.2 Knows UNCRC", value: (r) => (r.uncrc_familiar ? "Yes" : "No") },
  { header: "3.2 Rights named", value: (r) => r.uncrc_rights ?? "" },
  { header: "3.3 Rights at risk", value: (r) => r.rights_at_risk },
  { header: "3.4 Situation witnessed", value: (r) => r.rights_violation_witnessed },
  { header: "3.5 Why child-led", value: (r) => r.why_child_led },
  { header: "4.1 Prior involvement", value: (r) => r.prior_involvement ?? "" },
  { header: "4.2 Skills", value: (r) => r.skills_strengths },
  {
    header: "Recommenders",
    value: (r) =>
      (r.recommenders ?? [])
        .map((rec) => [rec.name, rec.email, rec.phone, rec.address].filter(Boolean).join(" / "))
        .join(" | "),
  },
  { header: "Letter file", value: (r) => r.recommendation_letter_name ?? "" },
  { header: "5.1 Time commitment", value: (r) => timeCommitmentLabel(r.time_commitment) },
  { header: "5.2 Attends meetings", value: (r) => meetingLabel(r.attends_meetings) },
  { header: "5.2 Availability note", value: (r) => r.attends_meetings_note ?? "" },
  { header: "5.3 Safeguarding agreed", value: (r) => (r.safeguarding_agreed ? "Yes" : "No") },
  { header: "6 Signature", value: (r) => r.applicant_signature },
  { header: "6 Date", value: (r) => r.declaration_date },
  { header: "Reviewer notes", value: (r) => r.reviewer_notes ?? "" },
  { header: "Reviewed by", value: (r) => r.reviewed_by ?? "" },
  { header: "Reviewed at", value: (r) => r.reviewed_at ?? "" },
];

function csvCell(value: string): string {
  const normalised = value.replace(/\r\n/g, "\n");
  // Neutralise spreadsheet formula injection — these rows are free text
  // typed by applicants and get opened in Excel.
  const guarded = /^[=+\-@\t]/.test(normalised) ? `'${normalised}` : normalised;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET() {
  const context = await getAdminContext();
  if (!context?.admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("export failed", error);
    return NextResponse.json({ error: "Could not build the export." }, { status: 502 });
  }

  const rows = (data ?? []) as ApplicationRow[];
  const lines = [
    COLUMNS.map((column) => csvCell(column.header)).join(","),
    ...rows.map((row) => COLUMNS.map((column) => csvCell(column.value(row) ?? "")).join(",")),
  ];

  const stamp = new Date().toISOString().slice(0, 10);

  // BOM so Excel reads the UTF-8 (including Amharic) correctly.
  return new NextResponse(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aclic-applications-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
