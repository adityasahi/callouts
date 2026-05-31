import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLOR_MAP = {
  red:     'bg-red-500/15 text-red-600',
  orange:  'bg-orange-500/15 text-orange-600',
  amber:   'bg-amber-500/15 text-amber-600',
  emerald: 'bg-emerald-500/15 text-emerald-600',
  teal:    'bg-teal-500/15 text-teal-600',
  sky:     'bg-sky-500/15 text-sky-600',
  violet:  'bg-violet-500/15 text-violet-600',
  pink:    'bg-pink-500/15 text-pink-600',
};

function AvatarBadge({ alterEgo, avatarColor }) {
  const colorCls = COLOR_MAP[avatarColor] || COLOR_MAP.sky;
  const initials = alterEgo
    ? alterEgo.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${colorCls}`}>
      {initials}
    </div>
  );
}

export default function CommentThreadModal({ submission, user, open, onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', submission?.id],
    queryFn: () => base44.entities.Comment.filter({ submission_id: submission.id }, 'created_date'),
    enabled: !!submission?.id && open,
    refetchInterval: open ? 5000 : false,
  });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments, open]);

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!text.trim()) return;
      await base44.entities.Comment.create({
        submission_id: submission.id,
        user_id: user.id,
        alter_ego: user.alter_ego || user.full_name || 'Anonymous',
        avatar_color: user.avatar_color || 'sky',
        text: text.trim(),
      });
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['comments', submission?.id] });
      queryClient.invalidateQueries({ queryKey: ['comment-count', submission?.id] });
    },
  });

  const handlePost = (e) => {
    e.preventDefault();
    if (!text.trim() || postMutation.isPending) return;
    postMutation.mutate();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Slide-up sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-3xl max-h-[80vh] shadow-2xl"
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="font-heading font-semibold text-sm">
                  Comments {comments.length > 0 && <span className="text-muted-foreground font-normal">({comments.length})</span>}
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submission preview */}
            {submission?.image_url && (
              <div className="px-5 pt-3 shrink-0">
                <div className="flex gap-3 items-center bg-muted rounded-xl p-2.5">
                  <img src={submission.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{submission.user_name || 'Anonymous'}</p>
                    {submission.caption && (
                      <p className="text-xs text-muted-foreground truncate">{submission.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No comments yet — be the first!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 items-start">
                    <AvatarBadge alterEgo={c.alter_ego} avatarColor={c.avatar_color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-none mb-1">{c.alter_ego || 'Anonymous'}</p>
                      <p className="text-sm leading-snug">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handlePost}
              className="shrink-0 px-4 py-3 border-t border-border flex gap-2 items-center bg-background"
            >
              {user && <AvatarBadge alterEgo={user.alter_ego || user.full_name} avatarColor={user.avatar_color} />}
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                maxLength={280}
              />
              <button
                type="submit"
                disabled={!text.trim() || postMutation.isPending}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
              >
                {postMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}