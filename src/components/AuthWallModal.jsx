import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AuthWallModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="fixed inset-x-4 bottom-1/4 z-50 max-w-sm mx-auto bg-card border border-border rounded-2xl shadow-2xl p-6 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>

            <h2 className="font-heading font-bold text-xl mb-1">Join Callouts</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Create an account to complete challenges, vote on submissions, and climb the leaderboard.
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full rounded-xl font-heading font-semibold" onClick={onClose}>
                <Link to="/register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up — It's Free
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl font-heading font-semibold" onClick={onClose}>
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </Link>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}