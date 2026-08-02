import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/form-schema";
import { LETTERS_BUCKET } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const requestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine((type) => type in ACCEPTED_UPLOAD_TYPES, {
    message: "Unsupported file type.",
  }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

/**
 * Mints a short-lived signed upload URL so the browser can send the
 * recommendation letter straight to Supabase Storage. Keeping the file out
 * of the Next.js request body means phone photos are not capped by the
 * serverless request size limit.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload request." },
      { status: 400 },
    );
  }

  const extension = ACCEPTED_UPLOAD_TYPES[parsed.data.contentType];
  // The original filename never reaches storage — it is attacker-controlled
  // and is kept only as a display label on the application row.
  const path = `applications/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(LETTERS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("createSignedUploadUrl failed", error);
      return NextResponse.json(
        { error: "Could not prepare the upload. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (cause) {
    console.error("upload-url route failed", cause);
    return NextResponse.json({ error: "Upload service unavailable." }, { status: 500 });
  }
}
