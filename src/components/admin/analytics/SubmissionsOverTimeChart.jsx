import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import ChartCard, { exportToCSV } from './ChartCard';

export default function SubmissionsOverTimeChart({ submissions, startDate, endDate }) {
  const data = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end) || start > end) return [];

    const days = eachDayOfInterval({ start, end });
    return days.map((day) => {
      const label = format(day, 'MMM d');
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = submissions.filter((s) => s.created_date?.startsWith(dayStr)).length;
      return { date: label, submissions: count };
    });
  }, [submissions, startDate, endDate]);

  const handleExport = () => {
    exportToCSV('submissions_over_time.csv', data, ['date', 'submissions']);
  };

  return (
    <ChartCard
      title="Total Submissions Over Time"
      subtitle="Number of proof photos submitted per day"
      onExport={handleExport}
    >
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No data for selected range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="submissions" fill="hsl(262,60%,58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}