import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard, { exportToCSV } from './ChartCard';

const COLORS = [
  'hsl(16,85%,58%)',
  'hsl(262,60%,58%)',
  'hsl(173,58%,39%)',
  'hsl(43,74%,56%)',
  'hsl(197,60%,48%)',
  'hsl(340,70%,55%)',
  'hsl(100,55%,45%)',
  'hsl(220,65%,55%)',
  'hsl(30,80%,55%)',
  'hsl(280,55%,55%)',
];

export default function CategoryPieChart({ tasks, startDate, endDate, submissions }) {
  // Filter tasks by whether they have submissions in range
  const data = useMemo(() => {
    const submittedTaskIds = new Set(submissions.map((s) => s.task_id));
    const counts = {};
    tasks.forEach((t) => {
      if (!submittedTaskIds.has(t.id)) return;
      const cat = t.category || 'unknown';
      counts[cat] = (counts[cat] || 0) + submissions.filter((s) => s.task_id === t.id).length;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks, submissions]);

  const handleExport = () => {
    exportToCSV('task_categories.csv', data, ['name', 'value']);
  };

  return (
    <ChartCard
      title="Popular Task Categories"
      subtitle="Submission count by challenge category"
      onExport={handleExport}
    >
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No data for selected range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              formatter={(val, name) => [`${val} submissions`, name]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}