import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DareZoneLogo from '@/components/DareZoneLogo';

export default function GeoBlockedScreen({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-background px-8 text-center"
    >
      {/* Brand mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <DareZoneLogo className="w-14 h-14" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-destructive/10 border-2 border-background flex items-center justify-center">
            <MapPin className="w-4 h-4 text-destructive" />
          </div>
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-foreground">DareZone</span>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-8 max-w-xs"
      >
        <h2 className="font-heading font-bold text-2xl text-foreground leading-tight">
          Location Access Required
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          DareZone requires location access to find local challenges near you.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3 w-full max-w-xs"
      >
        <Button
          className="w-full rounded-xl font-heading font-semibold h-12 text-base shadow-lg shadow-primary/20"
          onClick={onRetry}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Enable Location Services
        </Button>
        <p className="text-xs text-muted-foreground">
          You may need to allow location in your browser settings.
        </p>
      </motion.div>
    </motion.div>
  );
}