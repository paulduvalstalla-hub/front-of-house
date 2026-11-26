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

export const metadata: Metadata = {
  title: "Front of House — the review reply desk for restaurants",
  description:
    "Front of House reads every guest review from Google, TripAdvisor, Yelp and OpenTable, drafts a reply in your restaurant's voice, and holds the risky ones for the owner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
