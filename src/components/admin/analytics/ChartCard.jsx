import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

function exportToCSV(filename, rows, headers) {
  const csvRows = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { exportToCSV };

export default function ChartCard({ title, subtitle, onExport, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-heading font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0 h-7 text-xs" onClick={onExport}>
          <Download className="w-3 h-3" />
          Export CSV
        </Button>
      </div>
      {children}
    </div>
  );
}