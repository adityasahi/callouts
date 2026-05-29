import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmissionFeed({ taskId, user }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions-feed', taskId],
    queryFn: () => base44.entities.Submission.filter({ task_id: taskId }, '-community_votes'),
  });

  const voteMutation = useMutation({
    mutationFn: async (sub) => {
      if (!user) { toast.error('Log in to vote'); return; }
      const voters = sub.voters || [];
      if (voters.includes(user.id)) { toast.error("You've already upvoted this"); return; }
      await base44.entities.Submission.update(sub.id, {
        community_votes: (sub.community_votes || 0) + 1,
        voters: [...voters, user.id],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions-feed', taskId] }),
  });

  if (submissions.length === 0) return null;

  const visible = expanded ? submissions : submissions.slice(0, 2);

  return (
    <div className="mt-2 space-y-2">
      <AnimatePresence initial={false}>
        {visible.map((sub) => {
          const hasVoted = sub.voters?.includes(user?.id);
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex gap-3 bg-card border border-border rounded-xl p-3 items-start"
            >
              {/* Thumbnail */}
              {sub.image_url && (
                <img
                  src={sub.image_url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{sub.user_name || 'Anonymous'}</p>
                {sub.caption && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sub.caption}</p>
                )}
              </div>

              {/* Upvote */}
              <button
                onClick={() => voteMutation.mutate(sub)}
                className={`flex flex-col items-center gap-0.5 shrink-0 transition-colors ${
                  hasVoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasVoted ? 'fill-primary' : ''}`} />
                <span className="text-[10px] font-medium">{sub.community_votes || 0}</span>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {submissions.length > 2 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {submissions.length - 2} more</>
          )}
        </button>
      )}
    </div>
  );
}