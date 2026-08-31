import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Globe2, HandHeart, Radio, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pastorConfig, serviceSchedule, siteConfig } from "@/lib/config/site";
import { getSiteContent } from "@/lib/content/site-content";

export const metadata: Metadata = {
  title: "About the Ministry",
  description:
    "The mandate and leadership behind Omega Replenishers International Ministry, founded by Prophet Shedrack A. O.",
};

export const revalidate = 30;

const pillars = [
  {
    title: "Gather",
    description:
      "Bringing people from every nation together as one body, regardless of distance or background.",
    Icon: Globe2,
  },
  {
    title: "Intercede",
    description:
      "Standing in continual, watchful prayer for individuals, families, and nations.",
    Icon: HandHeart,
  },
  {
    title: "Replenish",
    description:
      "Releasing prophetic breakthrough that restores what has been lost and renews the Earth.",
    Icon: Sparkles,
  },
] as const;

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Mandate"
          title={`About ${siteConfig.name}`}
          description={content.about_description}
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
          {pillars.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-navy-100 bg-navy-50/50 p-6 text-center"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-gold">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="mx-auto w-full max-w-xs">
            <div className="overflow-hidden rounded-2xl border-4 border-white shadow-xl ring-1 ring-navy-100">
              <Image
                src={pastorConfig.photoSrc}
                alt={pastorConfig.name}
                width={640}
                height={800}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="section-eyebrow">Founder &amp; Senior Pastor</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {pastorConfig.name}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-600">
              &ldquo;{content.about_bio}&rdquo;
            </p>
            <p className="mt-4 text-sm text-navy-400">
              {pastorConfig.name} is the {pastorConfig.title.toLowerCase()} of{" "}
              {pastorConfig.ministryName}.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-xl border border-navy-100 bg-navy-50 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
            <Radio className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-navy-900">
            {serviceSchedule.label}
          </h3>
          <p className="mt-2 text-sm text-navy-500">
            {serviceSchedule.days} &middot; {serviceSchedule.nigeriaTime}{" "}
            Nigeria Time &middot; {serviceSchedule.usEasternTime} US Eastern
          </p>
          <Link href="/live-broadcast" className="btn-gold mt-6">
            Join the Broadcast
          </Link>
        </div>
      </div>
    </div>
  );
}
