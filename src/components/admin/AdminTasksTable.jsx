import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BulkToolbar from './BulkToolbar';
import { toast } from 'sonner';

const DIFF_COLORS = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-orange-100 text-orange-700',
  extreme: 'bg-red-100 text-red-700',
  flash: 'bg-violet-100 text-violet-700',
};

export default function AdminTasksTable() {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 200),
  });

  const toggleAll = () => {
    if (selected.size === tasks.length) setSelected(new Set());
    else setSelected(new Set(tasks.map((t) => t.id)));
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAction = async (action, status) => {
    setLoading(true);
    const res = await base44.functions.invoke('adminBulkAction', {
      entity: 'Task',
      ids: [...selected],
      action,
      status,
    });
    if (res.data?.ok) {
      toast.success(`Bulk ${action} applied to ${selected.size} task(s)`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    } else {
      toast.error(res.data?.error || 'Action failed');
    }
    setLoading(false);
  };

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>;
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === tasks.length && tasks.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Prompt</th>
              <th className="p-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Category</th>
              <th className="p-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Difficulty</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task, i) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`hover:bg-muted/30 transition-colors cursor-pointer ${selected.has(task.id) ? 'bg-primary/5' : ''}`}
                onClick={() => toggle(task.id)}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(task.id)}
                    onChange={() => toggle(task.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </td>
                <td className="p-3">
                  <p className="font-medium line-clamp-1">{task.prompt_text}</p>
                  {task.location_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {task.location_name}
                    </p>
                  )}
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-muted-foreground capitalize">{task.category}</span>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFF_COLORS[task.difficulty] || 'bg-muted text-muted-foreground'}`}>
                    {task.difficulty}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-heading font-bold text-primary flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {task.point_value}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">No tasks found.</p>
        )}
      </div>

      <BulkToolbar
        selectedCount={selected.size}
        onAction={handleAction}
        onClear={() => setSelected(new Set())}
        loading={loading}
      />
    </>
  );
}