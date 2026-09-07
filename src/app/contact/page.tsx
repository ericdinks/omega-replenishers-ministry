import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Radio } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { serviceSchedule, siteConfig } from "@/lib/config/site";
import { getSiteContent } from "@/lib/content/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${siteConfig.name} by phone, WhatsApp, or email, and find our broadcast schedule.`,
  alternates: { canonical: "/contact" },
};

export const revalidate = 30;

export default async function ContactPage() {
  const content = await getSiteContent();
  const phoneDigits = content.contact_phone.replace(/[^\d]/g, "");

  const contactMethods = [
    {
      label: "Call",
      value: content.contact_phone,
      href: `tel:+${phoneDigits}`,
      Icon: Phone,
    },
    {
      label: "WhatsApp",
      value: content.contact_phone,
      href: `https://wa.me/${phoneDigits}`,
      Icon: MessageCircle,
    },
    {
      label: "Email",
      value: content.contact_email,
      href: `mailto:${content.contact_email}`,
      Icon: Mail,
    },
  ] as const;

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Contact Us"
          description="We'd love to hear from you. Reach the ministry team directly, or join us live for weekday service."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {contactMethods.map(({ label, value, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col items-center rounded-xl border border-navy-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-gold transition-colors group-hover:bg-gold group-hover:text-navy-900">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-navy-900">
                {label}
              </h3>
              <p className="mt-2 text-sm text-navy-500">{value}</p>
            </a>
          ))}
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-navy-100 bg-navy-50 p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
              <MapPin className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
              Find Us
            </h3>
            <p className="mt-2 text-sm text-navy-500">{content.contact_address}</p>
            <div className="mt-6 overflow-hidden rounded-lg border border-navy-100">
              <iframe
                title={`Map of ${content.contact_address}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  content.contact_address
                )}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 bg-navy-50 p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
              <Radio className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
              {serviceSchedule.label}
            </h3>
            <p className="mt-2 text-sm text-navy-500">
              {serviceSchedule.days}
              <br />
              {serviceSchedule.nigeriaTime} Nigeria Time
              <br />
              {serviceSchedule.usEasternTime} US Eastern
            </p>
            <Link href="/live-broadcast" className="btn-gold mt-6">
              Join the Broadcast
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
