import { Badge } from "@/components/ui/badge";
import { MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const difficultyConfig = {
  easy: { label: 'Easy', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  medium: { label: 'Medium', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  hard: { label: 'Hard', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
  extreme: { label: 'Extreme', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

const categoryEmoji = {
  photography: '📸', fitness: '💪', exploration: '🧭',
  food: '🍕', art: '🎨', social: '👋', nature: '🌿', culture: '🏛️',
};

export default function TaskCard({ task, index = 0 }) {
  const diff = difficultyConfig[task.difficulty] || difficultyConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/challenge/${task.id}`} className="block group">
        <div className="relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          {/* Image */}
          {task.image_url ? (
            <div className="relative h-40 overflow-hidden">
              <img
                src={task.image_url}
                alt={task.prompt_text}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className={`${diff.class} border text-xs`}>{diff.label}</Badge>
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {task.point_value} pts
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl">{categoryEmoji[task.category] || '🎯'}</span>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className={`${diff.class} border text-xs`}>{diff.label}</Badge>
                <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {task.point_value} pts
                </Badge>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <p className="font-heading font-semibold text-sm leading-snug line-clamp-2 text-foreground">
              {task.prompt_text}
            </p>
            {task.location_name && (
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-xs truncate">{task.location_name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}