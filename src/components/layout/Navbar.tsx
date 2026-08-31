"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Cross } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/config/site";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/80">
      <nav className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white"
          onClick={() => setIsOpen(false)}
        >
          <Cross className="h-6 w-6 text-gold" aria-hidden="true" />
          <span className="font-display text-base font-bold leading-tight sm:text-lg">
            {siteConfig.shortName}
          </span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-xs font-medium uppercase tracking-wide transition-colors ${
                  isActive ? "text-gold" : "text-white/80 hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link href="/giving" className="btn-gold hidden xl:inline-flex">
          Give Now
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white xl:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/10 bg-navy-900 xl:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wide ${
                    isActive
                      ? "bg-white/5 text-gold"
                      : "text-white/80 hover:bg-white/5 hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/giving"
              onClick={() => setIsOpen(false)}
              className="btn-gold mt-2"
            >
              Give Now
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
