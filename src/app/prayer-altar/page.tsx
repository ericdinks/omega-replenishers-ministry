import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrayerForm } from "@/components/prayer/PrayerForm";

export const metadata: Metadata = {
  title: "Prayer Altar",
  description:
    "Bring your confidential prayer request before the Omega Replenishers International Ministry prayer team.",
};

export default function PrayerAltarPage() {
  return (
    <div className="bg-navy-radial py-16 text-white sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="You Are Not Alone"
          title="The Prayer Altar"
          description="Whatever you're facing, bring it here. Our prayer team stands in agreement with every request submitted."
          light
        />

        <div className="mx-auto mt-12 max-w-xl rounded-xl bg-white p-8 shadow-2xl sm:p-10">
          <PrayerForm />
        </div>
      </div>
    </div>
  );
}
