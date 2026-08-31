import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DonationTiers } from "@/components/giving/DonationTiers";
import { CustomAmountForm } from "@/components/giving/CustomAmountForm";
import { getActiveDonationTiers } from "@/lib/content/donation-tiers";

export const metadata: Metadata = {
  title: "Giving",
  description:
    "Support Omega Replenishers International Ministry through tithes, offerings, and kingdom seed via PayPal.",
};

export const revalidate = 30;

export default async function GivingPage() {
  const tiers = await getActiveDonationTiers();

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Tithing & Giving"
          title="Sow Into This Ministry"
          description="Every gift advances live broadcasts, prophetic training, and outreach around the world. All giving is processed securely through PayPal."
        />

        <div className="mx-auto mt-12 max-w-4xl">
          <DonationTiers tiers={tiers} />

          <div className="mt-8">
            <CustomAmountForm />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-navy-100 bg-navy-50 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-700" />
            <p className="text-sm text-navy-500">
              All transactions are handled directly by PayPal. This
              ministry never collects or stores your card or bank details.
              You&rsquo;ll be redirected to PayPal to complete your gift securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
