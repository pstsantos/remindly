import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { X, Play, SkipForward, Trash2 } from 'lucide-react';
import type { Pattern, Path, ScheduledOccurrence, PracticeEvent } from '@/types/fixation';
import { PatternPills } from '@/components/PatternPills';

interface DayDetailItem {
  pattern?: Pattern;
  path?: Path;
  patternId: string;
  type: 'scheduled' | 'completed';
  event?: PracticeEvent;
}

interface DayDetailSheetProps {
  date: string | null;
  items: DayDetailItem[];
  onClose: () => void;
  onLogNow?: (patternId: string) => void;
  onSkip?: (patternId: string) => void;
  onDelete?: (patternId: string) => void;
}

export function DayDetailSheet({ date, items, onClose, onLogNow, onSkip, onDelete }: DayDetailSheetProps) {
  if (!date) return null;

  const dateObj = new Date(date + 'T00:00:00');

  return (
    <AnimatePresence>
      {date && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/10 z-40"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-soft max-h-[60vh] overflow-y-auto border-t border-border"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif text-foreground">
                  {format(dateObj, 'EEEE, MMM d')}
                </h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nothing scheduled for this day.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div
                      key={`${item.patternId}-${i}`}
                      className="p-4 rounded-xl bg-secondary border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.pattern?.name || 'Unknown pattern'}
                          </p>
                          <PatternPills path={item.path} className="mt-1" />
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {item.type === 'completed'
                              ? `Completed · ${item.event?.difficulty}`
                              : 'Scheduled'}
                          </p>
                        </div>

                        {item.type === 'scheduled' && (
                          <div className="flex items-center gap-1 ml-2">
                            {onLogNow && (
                              <button
                                onClick={() => onLogNow(item.patternId)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                                title="Log now"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {onSkip && (
                              <button
                                onClick={() => onSkip(item.patternId)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                                title="Skip"
                              >
                                <SkipForward className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item.patternId)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-foreground/5 transition-colors"
                                title="Delete pattern"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
