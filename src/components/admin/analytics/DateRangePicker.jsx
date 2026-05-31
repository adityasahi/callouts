import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';

export default function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
      <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-muted-foreground">Filter by date:</span>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="w-36 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}