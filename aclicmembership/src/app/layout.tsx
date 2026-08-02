import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ORG_NAME, ORG_SHORT } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${ORG_SHORT} Membership Application`,
    template: `%s · ${ORG_SHORT}`,
  },
  description: `Apply to join the ${ORG_NAME} (${ORG_SHORT}) — a child-led coalition advancing children's rights, participation and protection.`,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1a1815",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
