import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/auth";
import { ORG_SHORT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logos/aclic.png"
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-xl ring-1 ring-ink-700"
            priority
          />
          <h1 className="mt-5 text-xl font-bold text-white">{ORG_SHORT} application review</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            For coalition staff and focal points only.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          {isSupabaseConfigured() ? (
            <LoginForm nextPath={next ?? "/admin"} />
          ) : (
            <div className="text-sm leading-relaxed text-ink-700">
              <p className="font-semibold text-ink-900">Supabase is not configured yet.</p>
              <p className="mt-2">
                Set <code className="rounded bg-ink-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="rounded bg-ink-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
                <code className="rounded bg-ink-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> in your
                environment, then redeploy. See the project README for the full setup steps.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            ← Back to the application form
          </Link>
        </p>
      </div>
    </div>
  );
}
