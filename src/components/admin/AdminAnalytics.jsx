import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, parseISO, isValid } from 'date-fns';
import DateRangePicker from './analytics/DateRangePicker';
import DailyActiveUsersChart from './analytics/DailyActiveUsersChart';
import SubmissionsOverTimeChart from './analytics/SubmissionsOverTimeChart';
import CategoryPieChart from './analytics/CategoryPieChart';

const toDateStr = (date) => format(date, 'yyyy-MM-dd');

export default function AdminAnalytics() {
  const [startDate, setStartDate] = useState(toDateStr(subDays(new Date(), 29)));
  const [endDate, setEndDate] = useState(toDateStr(new Date()));

  const handleRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const { data: allSubmissions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ['admin-analytics-submissions'],
    queryFn: () => base44.entities.Submission.list('-created_date', 500),
  });

  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['admin-analytics-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 500),
  });

  // Filter submissions to selected date range
  const filteredSubmissions = useMemo(() => {
    if (!startDate || !endDate) return allSubmissions;
    const start = parseISO(startDate);
    const end = parseISO(endDate + 'T23:59:59');
    if (!isValid(start) || !isValid(end)) return allSubmissions;
    return allSubmissions.filter((s) => {
      if (!s.created_date) return false;
      const d = new Date(s.created_date);
      return d >= start && d <= end;
    });
  }, [allSubmissions, startDate, endDate]);

  const isLoading = loadingSubs || loadingTasks;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-base">Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Key performance metrics filtered by date range.</p>
      </div>

      <DateRangePicker startDate={startDate} endDate={endDate} onChange={handleRangeChange} />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <DailyActiveUsersChart
            submissions={filteredSubmissions}
            startDate={startDate}
            endDate={endDate}
          />
          <SubmissionsOverTimeChart
            submissions={filteredSubmissions}
            startDate={startDate}
            endDate={endDate}
          />
          <CategoryPieChart
            tasks={allTasks}
            submissions={filteredSubmissions}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
}