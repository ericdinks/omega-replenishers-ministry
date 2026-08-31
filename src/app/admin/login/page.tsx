import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Operator Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-navy-radial px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold">
            <ShieldCheck className="h-7 w-7" />
          </span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-bold text-navy-900">
          Ministry Operator Login
        </h1>
        <p className="mt-2 text-center text-sm text-navy-500">
          Restricted access for ministry staff managing prayer requests.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
