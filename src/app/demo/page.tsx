import type { Metadata } from "next";
import { DemoTour } from "@/components/demo/demo-tour";

export const metadata: Metadata = {
  title: "Live demo — Front of House",
  description: "A quick tour of Petit Comptoir, the sample restaurant, then its live review inbox.",
};

export default function DemoPage() {
  return <DemoTour />;
}
