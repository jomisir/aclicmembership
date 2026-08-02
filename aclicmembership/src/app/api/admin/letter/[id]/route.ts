import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { LETTERS_BUCKET } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Redirects an authorised reviewer to a short-lived signed URL for an
 * application's recommendation letter. The bucket itself stays private.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getAdminContext();
  if (!context?.admin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: application, error } = await supabase
    .from("applications")
    .select("recommendation_letter_path, recommendation_letter_name")
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(LETTERS_BUCKET)
    .createSignedUrl(application.recommendation_letter_path, 120, {
      download: application.recommendation_letter_name ?? true,
    });

  if (signError || !signed) {
    console.error("letter signing failed", signError);
    return NextResponse.json({ error: "Could not open the letter." }, { status: 502 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
