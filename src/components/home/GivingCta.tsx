import Link from "next/link";
import { HandCoins } from "lucide-react";

export function GivingCta() {
  return (
    <section className="bg-gold-50 py-20 sm:py-24">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold-600 shadow-sm">
          <HandCoins className="h-7 w-7" />
        </span>
        <h2 className="max-w-xl font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Sow Into Kingdom Work That Transforms Nations
        </h2>
        <p className="max-w-xl text-navy-500">
          Your tithes, offerings, and seeds fund broadcasts, outreach, and
          the School of the Prophets around the world.
        </p>
        <Link href="/giving" className="btn-gold">
          Give Now
        </Link>
      </div>
    </section>
  );
}
