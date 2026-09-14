import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { PortalSignupForm } from "@/components/portal/PortalSignupForm";

export const metadata: Metadata = {
  title: "Create Student Account",
  robots: { index: false, follow: false },
};

export default function PortalSignupPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-navy-radial px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold">
            <GraduationCap className="h-7 w-7" />
          </span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-navy-900">
          Create Your Student Account
        </h1>
        <p className="mt-2 text-center text-sm text-navy-500">
          Sign up to browse and enroll in Training Portal courses.
        </p>
        <div className="mt-8">
          <PortalSignupForm />
        </div>
      </div>
    </div>
  );
}
