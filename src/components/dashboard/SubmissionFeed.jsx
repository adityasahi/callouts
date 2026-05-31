import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ThumbsDown, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import CommentThreadModal from './CommentThreadModal';
import LazyImage from '@/components/ui/LazyImage';

function CommentCount({ submissionId }) {
  const { data: comments = [] } = useQuery({
    queryKey: ['comment-count', submissionId],
    queryFn: () => base44.entities.Comment.filter({ submission_id: submissionId }, 'created_date'),
    staleTime: 30000,
  });
  return <span className="text-[10px] font-medium">{comments.length}</span>;
}

function SubmissionRow({ sub, user, onCommentClick }) {
  const queryClient = useQueryClient();
  const hasVoted = sub.voters?.includes(user?.id);

  const vote = useMutation({
    mutationFn: async (direction) => {
      if (!user) { toast.error('Log in to vote'); return; }
      const voters = sub.voters || [];
      // Strict one-vote-per-user enforcement
      if (voters.includes(user.id)) { toast.error("You've already voted on this"); return; }
      const delta = direction === 'up' ? 1 : -1;
      await base44.entities.Submission.update(sub.id, {
        community_votes: (sub.community_votes || 0) + delta,
        voters: [...voters, user.id],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions-feed', sub.task_id] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex gap-3 bg-card border border-border rounded-xl p-3 items-start"
    >
      {/* Thumbnail */}
      {sub.image_url && (
        <LazyImage
          src={sub.image_url}
          alt=""
          wrapperClassName="w-14 h-14 rounded-lg shrink-0"
          className="w-full h-full object-cover"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{sub.user_name || 'Anonymous'}</p>
        {sub.caption && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sub.caption}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Comment button */}
        <button
          onClick={() => onCommentClick(sub)}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <CommentCount submissionId={sub.id} />
        </button>

        {/* Upvote */}
        <button
          disabled={hasVoted}
          onClick={() => vote.mutate('up')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            hasVoted ? 'text-primary opacity-70 cursor-not-allowed' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasVoted ? 'fill-primary' : ''}`} />
          <span className="text-[10px] font-medium">{sub.community_votes || 0}</span>
        </button>

        {/* Downvote */}
        <button
          disabled={hasVoted}
          onClick={() => vote.mutate('down')}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            hasVoted ? 'opacity-30 cursor-not-allowed' : 'text-muted-foreground hover:text-destructive'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function SubmissionFeed({ taskId, user }) {
  const [expanded, setExpanded] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['submissions-feed', taskId],
    queryFn: async () => {
      const all = await base44.entities.Submission.filter({ task_id: taskId }, '-community_votes');
      return all.filter(s => s.status !== 'buried');
    },
  });

  // Hide buried submissions from the feed
  const submissions = allSubmissions.filter(s => s.status !== 'buried');

  if (submissions.length === 0) return null;

  const visible = expanded ? submissions : submissions.slice(0, 2);

  return (
    <>
      <div className="mt-2 space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((sub) => (
            <SubmissionRow
              key={sub.id}
              sub={sub}
              user={user}
              onCommentClick={setActiveSubmission}
            />
          ))}
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

      <CommentThreadModal
        submission={activeSubmission}
        user={user}
        open={!!activeSubmission}
        onClose={() => setActiveSubmission(null)}
      />
    </>
  );
}