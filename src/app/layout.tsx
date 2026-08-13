import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { VoiceModalProvider } from "@/components/VoiceModalProvider";
import { CookieNotice } from "@/components/CookieNotice";
import { SITE_URL } from "@/lib/site";

// Next injects the Font Awesome stylesheet above; stop the library from
// inserting a second copy at runtime (which causes oversized icons on load).
config.autoAddCss = false;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Software Engineering Services | SoftwarePros",
    template: "%s | SoftwarePros",
  },
  description:
    "AI. Software Engineering. Cybersecurity. Cloud Infrastructure. We engineer intelligent technology systems for organizations ready to replace complexity with automation, security, and scale.",
  // Canonicals are set per page, not here: a site-wide default would point
  // every route at "/" and collapse them in the index.
  openGraph: {
    type: "website",
    siteName: "SoftwarePros",
    title: "Build Software That Doesn't Break | SoftwarePros",
    description:
      "AI-first software engineering, cybersecurity, and cloud infrastructure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Software That Doesn't Break | SoftwarePros",
    description:
      "AI-first software engineering, cybersecurity, and cloud infrastructure.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {/* Client provider wraps server children as a slot — pages stay RSC. */}
        <VoiceModalProvider>{children}</VoiceModalProvider>
        <CookieNotice />
      </body>
    </html>
  );
}
