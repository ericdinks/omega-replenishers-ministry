import { Loader2 } from "lucide-react";

export default function PortalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white py-16">
      <div className="flex flex-col items-center gap-3 text-navy-400">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="text-sm">Loading the Training Portal...</p>
      </div>
    </div>
  );
}
