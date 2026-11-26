import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = {
  title: "Set up your restaurant — Front of House",
};

export default function OnboardingPage() {
  return <Onboarding />;
}
