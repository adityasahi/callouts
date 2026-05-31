import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 500); // wait for exit animation
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-accent"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6"
          >
            <svg width="72" height="84" viewBox="0 0 72 84" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pin body */}
              <path
                d="M36 4C21.641 4 10 15.641 10 30C10 48 36 80 36 80C36 80 62 48 62 30C62 15.641 50.359 4 36 4Z"
                fill="white"
                fillOpacity="0.95"
              />
              {/* Pin circle */}
              <circle cx="36" cy="30" r="15" fill="hsl(16,85%,58%)" />
              {/* Checkered flag — 2x2 grid inside circle */}
              <rect x="27" y="21" width="5" height="5" fill="white" />
              <rect x="32" y="21" width="5" height="5" fill="hsl(16,85%,58%)" fillOpacity="0.0" />
              <rect x="37" y="21" width="5" height="5" fill="white" />
              <rect x="27" y="26" width="5" height="5" fill="hsl(16,85%,58%)" fillOpacity="0.0" />
              <rect x="32" y="26" width="5" height="5" fill="white" />
              <rect x="37" y="26" width="5" height="5" fill="hsl(16,85%,58%)" fillOpacity="0.0" />
              {/* Checkered flag squares (dark) */}
              <rect x="29" y="23" width="4.5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.85)" />
              <rect x="38" y="23" width="4.5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.85)" />
              <rect x="33.5" y="28" width="4.5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.85)" />
              <rect x="24.5" y="28" width="4.5" height="4.5" rx="0.5" fill="rgba(0,0,0,0.85)" />
              {/* Flag pole */}
              <line x1="36" y1="20" x2="36" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Flag fabric */}
              <path d="M36 20 L44 23 L36 26 Z" fill="white" />
            </svg>
          </motion.div>

          {/* App name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-heading text-4xl font-bold text-white tracking-tight"
          >
            Callouts
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/70 text-sm mt-2 font-medium"
          >
            Explore. Challenge. Conquer.
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex gap-1.5 mt-10"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-white/60"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}