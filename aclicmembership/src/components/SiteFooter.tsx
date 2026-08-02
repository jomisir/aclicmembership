import Image from "next/image";
import Link from "next/link";
import { ORG_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          In partnership with
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-5">
          <Image
            src="/logos/save-the-children.png"
            alt="Save the Children"
            width={489}
            height={111}
            className="h-9 w-auto object-contain sm:h-10"
          />
          <Image
            src="/logos/osd.png"
            alt="Organization for Social Development"
            width={340}
            height={146}
            className="h-11 w-auto object-contain sm:h-12"
          />
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-6 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {ORG_NAME}
          </p>
          <Link href="/admin" className="text-ink-400 underline-offset-2 hover:underline">
            Coalition staff sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
