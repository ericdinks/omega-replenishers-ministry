import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiveBroadcastPlayer } from "@/components/broadcast/LiveBroadcastPlayer";

export const metadata: Metadata = {
  title: "Live Broadcast",
  description:
    "Join Omega Replenishers International Ministry live for every service, broadcast in real time.",
  alternates: { canonical: "/live-broadcast" },
};

export default function LiveBroadcastPage() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Join Us In Real Time"
          title="Live Broadcast"
          description="Tune in for live services, prophetic ministration, and impartation from anywhere in the world."
        />

        <div className="mt-12">
          <LiveBroadcastPlayer />
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-navy-100 bg-navy-50 p-6 text-center">
          <p className="text-sm text-navy-500">
            Broadcasts run weekly. Follow our social channels in the footer
            below to receive notifications the moment we go live.
          </p>
        </div>
      </div>
    </div>
  );
}
