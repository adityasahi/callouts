import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";

export default function RadiusSlider({ radius, onChange }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-heading font-semibold text-sm">Search Radius</span>
        </div>
        <div className="text-right">
          <span className="font-heading font-bold text-lg text-primary">{radius}</span>
          <span className="text-xs text-muted-foreground ml-1">miles</span>
        </div>
      </div>

      <Slider
        min={5}
        max={50}
        step={5}
        value={[radius]}
        onValueChange={([val]) => onChange(val)}
        className="w-full"
      />

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">5 mi</span>
        <span className="text-[10px] text-muted-foreground">50 mi</span>
      </div>
    </div>
  );
}