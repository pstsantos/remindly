import { motion } from 'framer-motion';
import type { Pattern, Path } from '@/types/fixation';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, ChevronDown } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useState } from 'react';

interface TodayCardProps {
  pattern: Pattern;
  path?: Path;
  nextRevisitDate?: string;
  onMarkPracticed: () => void;
  onSkip: () => void;
}

function getFixationLabel(count: number) {
  if (count <= 1) return 'First encounter';
  if (count <= 3) return 'Building familiarity';
  if (count <= 5) return 'Deepening';
  return 'Mastering';
}

export function TodayCard({ pattern, path, nextRevisitDate, onMarkPracticed, onSkip }: TodayCardProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-6 rounded-2xl gradient-warm p-6 shadow-soft relative overflow-hidden"
    >
      <div className="relative z-10">
        <p className="text-sm font-medium uppercase tracking-widest text-foreground/60 mb-1">
          Today
        </p>
        <h2 className="text-3xl font-serif leading-snug text-foreground mb-1">
          {pattern.name}
        </h2>
        {path && (
          <p className="text-sm text-foreground/70 mb-1">
            Path: {path.name}
          </p>
        )}
        <p className="text-sm text-foreground/50 mb-4">
          {getFixationLabel(pattern.successCount)} · Revisit #{pattern.successCount + 1}
        </p>
        {nextRevisitDate && (
          <p className="text-xs text-foreground/40 mb-5">
            Next revisit booked: {format(new Date(nextRevisitDate + 'T00:00:00'), 'MMM d')}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={onMarkPracticed}
            className="rounded-full px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark Practiced
          </Button>
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-foreground/10"
          >
            <button
              onClick={onSkip}
              className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip today
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function EmptyTodayCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-6 rounded-2xl gradient-card p-8 shadow-card text-center"
    >
      <h2 className="text-2xl font-serif text-foreground mb-2">
        Nothing scheduled
      </h2>
      <p className="text-sm text-muted-foreground">
        Tap + to log a practice session
      </p>
    </motion.div>
  );
}
