import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const PROMOTION_THRESHOLD = 15;

const CATEGORY_EMOJI = {
  photography: '📸', fitness: '💪', exploration: '🧭', food: '🍕',
  art: '🎨', social: '👋', nature: '🌿', culture: '🏛️', creative: '✨', wildcard: '🃏',
};

export default function PendingTaskCard({ task, user, index }) {
  const queryClient = useQueryClient();
  const [voting, setVoting] = useState(false);

  const hasVoted = user && (task.voters || []).includes(user.id);
  const isPromoted = task.status === 'promoted';
  const pct = Math.min(((task.upvotes || 0) / PROMOTION_THRESHOLD) * 100, 100);

  const handleUpvote = async () => {
    if (!user || hasVoted || isPromoted || voting) return;
    setVoting(true);

    const newVoters = [...(task.voters || []), user.id];
    const newUpvotes = (task.upvotes || 0) + 1;

    await base44.entities.PendingTask.update(task.id, {
      upvotes: newUpvotes,
      voters: newVoters,
    });

    // Promote if threshold reached
    if (newUpvotes >= PROMOTION_THRESHOLD && task.status !== 'promoted') {
      await base44.entities.Task.create({
        prompt_text: task.prompt_text,
        category: task.category,
        difficulty: 'medium',
        point_value: 25,
        source: 'Community Submitted',
      });
      await base44.entities.PendingTask.update(task.id, { status: 'promoted' });
    }

    queryClient.invalidateQueries({ queryKey: ['pending-tasks'] });
    setVoting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-card border rounded-2xl p-4 shadow-sm ${isPromoted ? 'border-emerald-300 bg-emerald-50/40' : 'border-border'}`}
    >
      {/* Promoted badge */}
      {isPromoted && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full">
            🎉 This challenge went live!
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
          {CATEGORY_EMOJI[task.category] || '🎯'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm leading-snug">{task.prompt_text}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">{task.category}</Badge>
            <span className="text-[10px] text-muted-foreground">by {task.submitted_by_name || 'Anonymous'}</span>
          </div>
        </div>

        {/* Upvote button */}
        <Button
          size="sm"
          variant={hasVoted || isPromoted ? 'secondary' : 'outline'}
          onClick={handleUpvote}
          disabled={hasVoted || isPromoted || voting || !user}
          className={`shrink-0 flex flex-col items-center h-auto py-1.5 px-2.5 rounded-xl gap-0 ${hasVoted ? 'text-primary border-primary' : ''}`}
        >
          <ChevronUp className="w-4 h-4" />
          <span className="font-heading font-bold text-xs">{task.upvotes || 0}</span>
        </Button>
      </div>

      {/* Progress bar */}
      {!isPromoted && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{task.upvotes || 0} / {PROMOTION_THRESHOLD} votes to go live</span>
            <span className="text-[10px] font-semibold text-primary">{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}