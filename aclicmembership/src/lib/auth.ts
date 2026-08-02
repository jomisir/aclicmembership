import { redirect } from "next/navigation";
import { createAdminClient } from "./supabase/admin";
import { createSupabaseServerClient } from "./supabase/server";

export interface AdminRecord {
  user_id: string;
  email: string;
  full_name: string | null;
}

export interface AdminContext {
  userId: string;
  email: string;
  admin: AdminRecord | null;
}

/** True once every Supabase environment variable the app needs is present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Resolves the signed-in user and whether they are on the `admins`
 * allowlist. Being authenticated in Supabase is not enough — anyone could
 * sign themselves up otherwise.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const service = createAdminClient();
  const { data } = await service
    .from("admins")
    .select("user_id, email, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    admin: (data as AdminRecord | null) ?? null,
  };
}

/** Same, but sends anonymous visitors to the login page. */
export async function requireAdminContext(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  return context;
}
