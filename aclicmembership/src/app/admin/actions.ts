"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/lib/types";

const ALLOWED_STATUSES: ApplicationStatus[] = [
  "pending",
  "approved",
  "waitlisted",
  "follow_up",
  "rejected",
];

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export interface ReviewState {
  ok?: boolean;
  error?: string;
}

export async function updateReviewAction(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const context = await getAdminContext();
  if (!context?.admin) {
    return { error: "You are not authorised to review applications." };
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("reviewer_notes") ?? "").trim();

  if (!id) return { error: "Missing application id." };
  if (!ALLOWED_STATUSES.includes(status as ApplicationStatus)) {
    return { error: "Unknown status." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("applications")
    .update({
      status,
      reviewer_notes: notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.admin.full_name || context.admin.email,
    })
    .eq("id", id);

  if (error) {
    console.error("updateReviewAction failed", error);
    return { error: "Could not save the review. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true };
}
