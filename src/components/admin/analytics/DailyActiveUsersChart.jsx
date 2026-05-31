import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import ChartCard, { exportToCSV } from './ChartCard';

export default function DailyActiveUsersChart({ submissions, startDate, endDate }) {
  const data = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end) || start > end) return [];

    const days = eachDayOfInterval({ start, end });
    return days.map((day) => {
      const label = format(day, 'MMM d');
      const dayStr = format(day, 'yyyy-MM-dd');
      const uniqueUsers = new Set(
        submissions
          .filter((s) => s.created_date?.startsWith(dayStr))
          .map((s) => s.user_id)
      );
      return { date: label, users: uniqueUsers.size };
    });
  }, [submissions, startDate, endDate]);

  const handleExport = () => {
    exportToCSV('daily_active_users.csv', data, ['date', 'users']);
  };

  return (
    <ChartCard
      title="Daily Active Users"
      subtitle="Unique submitters per day"
      onExport={handleExport}
    >
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No data for selected range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(16,85%,58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(16,85%,58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="users" stroke="hsl(16,85%,58%)" fill="url(#dauGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}