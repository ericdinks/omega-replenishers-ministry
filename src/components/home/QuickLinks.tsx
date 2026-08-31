import Link from "next/link";
import { GraduationCap, HandHeart, HeartHandshake, Radio } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const pillars = [
  {
    title: "Live Broadcast",
    description:
      "Join every service in real time from wherever you are in the world.",
    href: "/live-broadcast",
    Icon: Radio,
  },
  {
    title: "School of the Prophets",
    description:
      "Grow in prophetic ministry through structured teaching series.",
    href: "/school-of-the-prophets",
    Icon: GraduationCap,
  },
  {
    title: "Testimonies",
    description:
      "Read real accounts of healing, breakthrough, and restoration.",
    href: "/testimonials",
    Icon: HeartHandshake,
  },
  {
    title: "Prayer Altar",
    description:
      "Bring your confidential prayer request before the ministry team.",
    href: "/prayer-altar",
    Icon: HandHeart,
  },
] as const;

export function QuickLinks() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Get Connected"
          title="Everything You Need in One Place"
          description="From live services to prophetic training and prayer support, step into everything this ministry offers."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ title, description, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-start rounded-xl border border-navy-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-gold transition-colors group-hover:bg-gold group-hover:text-navy-900">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
