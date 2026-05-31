import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function EmptyFeedState({ radius }) {
  return (
    <motion.div
      key="empty-feed"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-center py-14 text-muted-foreground"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/8 flex items-center justify-center"
      >
        <MapPin className="w-8 h-8 text-primary/50" />
      </motion.div>

      <p className="text-sm font-semibold mb-1">No challenges nearby</p>
      <p className="text-xs max-w-[220px] mx-auto leading-relaxed mb-6">
        Try expanding your radius to discover more challenges around you!
      </p>

      {/* Animated arrow pointing upward toward the slider */}
      <div className="flex flex-col items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [4, 0, 4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          >
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'rotate(180deg)' }}
            >
              <path
                d="M2 10 L10 2 L18 10"
                stroke="hsl(16,85%,58%)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ))}
        <p className="text-[11px] text-primary font-semibold mt-1 tracking-wide uppercase">
          Expand radius
        </p>
      </div>
    </motion.div>
  );
}