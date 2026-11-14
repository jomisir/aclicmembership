import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily keep-alive, called by the Vercel cron in vercel.json.
 *
 * Supabase pauses free-plan projects after a week without activity, which
 * takes the form and the admin dashboard down until someone restores the
 * project by hand. One tiny query a day keeps it awake. The query only
 * counts rows and returns nothing about applicants.
 */
export async function GET(request: Request) {
  // Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("admins")
    .select("user_id", { count: "exact", head: true });

  if (error) {
    console.error("keepalive query failed", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
