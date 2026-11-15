import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import RevealObserver from "@/components/RevealObserver";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scene - The home of live music",
  description:
    "The shared gig calendar for you and your friends. Import or scan tickets automatically, collect stubs and review shows.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ourscene.uk"),
  icons: {
    icon: "/scene-logo.svg",
    shortcut: "/scene-logo.svg",
    apple: "/scene-logo.svg",
  },
  openGraph: {
    title: "Scene - The home of live music",
    description:
      "The shared gig calendar for you and your friends. Import or scan tickets automatically, collect stubs and review shows.",
    url: "https://ourscene.uk",
    siteName: "Scene",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scene - The home of live music",
    description:
      "The shared gig calendar for you and your friends. Import or scan tickets automatically, collect stubs and review shows.",
  },
  // TODO: Add the Smart App Banner once the app is live on the App Store.
  // Uncomment and fill in the App Store ID from App Store Connect → App Information:
  // other: {
  //   "apple-itunes-app": "app-id=<APP_STORE_ID>",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-scene-bg text-white antialiased">
        {/* Marks the document as JS-enabled so reveal animations only hide
            content when they can also show it again. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
