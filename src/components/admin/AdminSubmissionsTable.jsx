import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import BulkToolbar from './BulkToolbar';
import { toast } from 'sonner';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700',
  buried: 'bg-red-100 text-red-700',
};

export default function AdminSubmissionsTable() {
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: () => base44.entities.Submission.list('-created_date', 200),
  });

  const toggleAll = () => {
    if (selected.size === submissions.length) setSelected(new Set());
    else setSelected(new Set(submissions.map((s) => s.id)));
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
      entity: 'Submission',
      ids: [...selected],
      action,
      status,
    });
    if (res.data?.ok) {
      toast.success(`Bulk ${action} applied to ${selected.size} submission(s)`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
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
                  checked={selected.size === submissions.length && submissions.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Submission</th>
              <th className="p-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">User</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Votes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.map((sub, i) => (
              <motion.tr
                key={sub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`hover:bg-muted/30 transition-colors cursor-pointer ${selected.has(sub.id) ? 'bg-primary/5' : ''}`}
                onClick={() => toggle(sub.id)}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(sub.id)}
                    onChange={() => toggle(sub.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {sub.image_url && (
                      <img src={sub.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <p className="text-muted-foreground text-xs line-clamp-2">{sub.caption || 'No caption'}</p>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <span className="font-medium">{sub.user_name || 'Anonymous'}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[sub.status] || 'bg-muted text-muted-foreground'}`}>
                    {sub.status || 'active'}
                  </span>
                </td>
                <td className="p-3">
                  <span className="flex items-center gap-1 text-primary font-bold font-heading">
                    <Heart className="w-3 h-3" /> {sub.community_votes || 0}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">No submissions found.</p>
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