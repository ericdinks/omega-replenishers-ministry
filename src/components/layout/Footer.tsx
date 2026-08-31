import Link from "next/link";
import { Facebook, Youtube, Cross } from "lucide-react";
import { navLinks, siteConfig, socialLinks } from "@/lib/config/site";

// Lucide has no first-party TikTok glyph; a small inline mark keeps the
// footer's icon set visually consistent without pulling in another dep.
function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16.6 5.82c-.9-.88-1.47-2.02-1.6-3.32V2h-3.14v13.4a2.59 2.59 0 1 1-1.83-2.48V9.66a5.75 5.75 0 1 0 4.97 5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.28a4.85 4.85 0 0 1-2.7-1.46z" />
    </svg>
  );
}

const socialItems = [
  { name: "TikTok", href: socialLinks.tiktok, Icon: TikTokIcon },
  { name: "YouTube", href: socialLinks.youtube, Icon: Youtube },
  { name: "Facebook", href: socialLinks.facebook, Icon: Facebook },
].filter((item) => item.href);

interface FooterProps {
  phone: string;
  email: string;
}

export function Footer({ phone, email }: FooterProps) {
  const year = new Date().getFullYear();
  const phoneHref = `tel:+${phone.replace(/[^\d]/g, "")}`;

  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Cross className="h-6 w-6 text-gold" aria-hidden="true" />
            <span className="font-display text-lg font-bold">
              {siteConfig.shortName}
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">
            {siteConfig.description}
          </p>
          {socialItems.length > 0 ? (
            <div className="mt-6 flex items-center gap-4">
              {socialItems.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-navy-100 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="section-eyebrow">Explore</h3>
          <ul className="mt-4 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-navy-200 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="section-eyebrow">Connect</h3>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={phoneHref}
                className="text-sm text-navy-200 transition-colors hover:text-gold"
              >
                {phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${email}`}
                className="text-sm text-navy-200 transition-colors hover:text-gold"
              >
                {email}
              </a>
            </li>
            <li>
              <Link
                href="/admin"
                className="text-sm text-navy-400 transition-colors hover:text-gold"
              >
                Operator Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <p className="container-page text-center text-xs text-navy-400">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
