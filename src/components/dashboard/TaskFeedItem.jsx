import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CompleteTaskModal from './CompleteTaskModal';
import SubmissionFeed from './SubmissionFeed';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthWall } from '@/lib/useAuthWall';
import AuthWallModal from '@/components/AuthWallModal';

const difficultyConfig = {
  easy:    { label: 'Easy',    cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  medium:  { label: 'Medium',  cls: 'bg-amber-500/10  text-amber-600  border-amber-500/20'  },
  hard:    { label: 'Hard',    cls: 'bg-red-500/10    text-red-600    border-red-500/20'    },
  extreme: { label: 'Extreme', cls: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

const categoryEmoji = {
  photography: '📸', fitness: '💪', exploration: '🧭',
  food: '🍕', art: '🎨', social: '👋', nature: '🌿', culture: '🏛️',
};

export default function TaskFeedItem({ task, user, index = 0 }) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const diff = difficultyConfig[task.difficulty] || difficultyConfig.medium;
  const { requireAuth, authWallOpen, closeAuthWall } = useAuthWall(user);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['submissions-feed', task.id] });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Cover image / placeholder */}
        <Link to={`/challenge/${task.id}`} className="block group">
          {task.image_url ? (
            <div className="relative h-44 overflow-hidden">
              <img
                src={task.image_url}
                alt={task.prompt_text}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className={`${diff.cls} border text-xs`}>{diff.label}</Badge>
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                  <Zap className="w-3 h-3 mr-1" />{task.point_value} pts
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-5xl">{categoryEmoji[task.category] || '🎯'}</span>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className={`${diff.cls} border text-xs`}>{diff.label}</Badge>
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                  <Zap className="w-3 h-3 mr-1" />{task.point_value} pts
                </Badge>
              </div>
            </div>
          )}
        </Link>

        {/* Body */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm leading-snug">{task.prompt_text}</p>
              {task.location_name && (
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="text-xs truncate">{task.location_name}</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="shrink-0 rounded-xl font-heading font-semibold text-xs h-8 px-3"
              onClick={() => requireAuth(() => setModalOpen(true))}
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Complete
            </Button>
          </div>

          {/* Inline submission feed */}
          <SubmissionFeed taskId={task.id} user={user} />
        </div>
      </motion.div>

      <CompleteTaskModal
        task={task}
        user={user}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <AuthWallModal open={authWallOpen} onClose={closeAuthWall} />
    </>
  );
}