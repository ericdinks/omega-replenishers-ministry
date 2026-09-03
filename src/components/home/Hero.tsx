import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { LiveStatusBadge } from "@/components/home/LiveStatusBadge";
import { pastorConfig, siteConfig } from "@/lib/config/site";

interface HeroProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export function Hero({ title, description, imageUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gold-50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(212,175,55,0.14), transparent 40%), radial-gradient(circle at 85% 10%, rgba(212,175,55,0.10), transparent 35%)",
        }}
        aria-hidden="true"
      />
      <div className="container-page relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div className="text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <LiveStatusBadge />
          </div>

          <p className="section-eyebrow mt-8">{siteConfig.name}</p>

          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-navy-900 sm:text-5xl">
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg lg:mx-0">
            {description}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Link href="/live-broadcast" className="btn-gold">
              Watch Live
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/school-of-the-prophets" className="btn-outline-navy">
              <BookOpen className="h-4 w-4" />
              Enter the School of the Prophets
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div
            className="absolute -inset-6 -z-10 rounded-full bg-gold-200/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl ring-1 ring-navy-100">
            <Image
              src={imageUrl || pastorConfig.heroPhotoSrc}
              alt={pastorConfig.name}
              width={800}
              height={1000}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-6 py-2 text-center shadow-lg ring-1 ring-navy-100 sm:left-auto sm:right-4 sm:translate-x-0">
            <p className="font-display text-sm font-bold text-navy-900">
              {pastorConfig.name}
            </p>
            <p className="text-xs text-navy-400">{pastorConfig.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
