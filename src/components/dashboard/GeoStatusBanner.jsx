import { MapPin, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GeoStatusBanner({ status, onRetry }) {
  if (status === "granted") {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Location detected — showing nearby challenges</span>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
        <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
        <span>Detecting your location…</span>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center justify-between gap-2 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Location blocked — showing all challenges</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onRetry} className="text-xs h-6 px-2 text-amber-700">
          Retry
        </Button>
      </div>
    );
  }

  return null;
}