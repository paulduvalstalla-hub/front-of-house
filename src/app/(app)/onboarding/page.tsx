import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = {
  title: "Set up your restaurant — Front of House",
};

// Only real accounts get here: the proxy sends a demo visit to sign-up instead.
export default function OnboardingPage() {
  return <Onboarding />;
}
