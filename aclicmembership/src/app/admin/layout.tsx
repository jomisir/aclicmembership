import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAdminContext } from "@/lib/auth";
import { ORG_SHORT } from "@/lib/constants";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminContext();

  // The login page renders itself; the middleware keeps everyone else out.
  if (!context) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="no-print border-b border-ink-800 bg-ink-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/logos/aclic.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-md ring-1 ring-ink-700"
            />
            <span className="text-sm font-semibold tracking-wide text-gold-300">
              {ORG_SHORT} · Application review
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-ink-300 sm:inline">{context.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-ink-700 px-3 py-1.5 text-sm font-medium text-ink-200 transition hover:bg-ink-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
