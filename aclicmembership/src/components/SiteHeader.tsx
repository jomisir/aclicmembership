import Image from "next/image";
import Link from "next/link";
import { ORG_NAME, ORG_SHORT } from "@/lib/constants";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-ink-800 bg-ink-950 text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/aclic.png"
            alt=""
            width={44}
            height={44}
            className="size-10 rounded-md ring-1 ring-ink-700 sm:size-11"
            priority
          />
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide text-gold-300 sm:text-base">
              {ORG_SHORT}
            </span>
            {!compact ? (
              <span className="block text-[11px] text-ink-300 sm:text-xs">{ORG_NAME}</span>
            ) : null}
          </span>
        </Link>
      </div>
    </header>
  );
}
