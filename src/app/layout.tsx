import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const sans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const title = "Front of House — the review reply desk for restaurants";
const description =
  "Front of House reads every guest review from Google, Tripadvisor, Yelp and OpenTable, drafts a reply in your restaurant's voice, and holds the risky ones for the owner.";

export const metadata: Metadata = {
  metadataBase: new URL("https://front-of-house-one.vercel.app"),
  title,
  description,
  openGraph: { title, description, siteName: "Front of House", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
