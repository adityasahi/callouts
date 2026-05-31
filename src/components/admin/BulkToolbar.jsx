import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Archive, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_OPTIONS = ['active', 'archived', 'buried'];

export default function BulkToolbar({ selectedCount, onAction, onClear, loading }) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background rounded-2xl shadow-2xl px-4 py-3"
        >
          <span className="text-sm font-semibold mr-1 whitespace-nowrap">
            {selectedCount} selected
          </span>

          <div className="w-px h-5 bg-background/20 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => onAction('delete')}
            className="text-red-400 hover:text-red-300 hover:bg-white/10 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => onAction('archive')}
            className="text-amber-400 hover:text-amber-300 hover:bg-white/10 gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={loading}
                className="text-sky-400 hover:text-sky-300 hover:bg-white/10 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mb-2">
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onAction('update_status', s)}>
                  Set to <span className="font-semibold ml-1 capitalize">{s}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-background/20 mx-1" />

          <button onClick={onClear} className="text-background/50 hover:text-background transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}