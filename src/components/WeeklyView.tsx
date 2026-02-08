import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { ScheduledOccurrence, Pattern, Path, PracticeEvent } from '@/types/fixation';

// Soft pastel backgrounds for each day — inspired by the reference
const DAY_COLORS = [
  'bg-[hsl(250_30%_90%)]',   // Monday – lavender
  'bg-[hsl(350_35%_87%)]',   // Tuesday – blush
  'bg-[hsl(170_35%_85%)]',   // Wednesday – mint
  'bg-[hsl(45_50%_88%)]',    // Thursday – warm sand
  'bg-[hsl(210_30%_88%)]',   // Friday – soft blue
  'bg-[hsl(30_45%_87%)]',    // Saturday – peach
  'bg-[hsl(80_30%_87%)]',    // Sunday – sage
];

interface WeeklyViewProps {
  scheduled: ScheduledOccurrence[];
  patterns: Pattern[];
  paths: Path[];
  events: PracticeEvent[];
  onDayClick: (dateStr: string) => void;
}

export function WeeklyView({ scheduled, patterns, paths, events, onDayClick }: WeeklyViewProps) {
  const [displayWeek, setDisplayWeek] = useState(() => new Date());

  const weekDays = useMemo(() => {
    const start = startOfWeek(displayWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayScheduled = scheduled
        .filter(s => s.date === dateStr)
        .map(s => ({
          ...s,
          pattern: patterns.find(p => p.id === s.patternId),
          path: paths.find(pa => pa.id === patterns.find(p => p.id === s.patternId)?.pathId),
        }));
      const dayEvents = events.filter(e => e.date === dateStr);
      return {
        date,
        dateStr,
        dayScheduled,
        dayEvents,
        dayIndex: i,
        today: isToday(date),
        past: isPast(date) && !isToday(date),
      };
    });
  }, [scheduled, patterns, paths, events, displayWeek]);

  const handlePrev = () => setDisplayWeek(prev => subWeeks(prev, 1));
  const handleNext = () => setDisplayWeek(prev => addWeeks(prev, 1));

  const weekStart = startOfWeek(displayWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = format(weekStart, 'MMM d') + ' – ' + format(weekEnd, 'MMM d, yyyy');

  return (
    <div className="px-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <h3 className="text-sm font-medium text-foreground/80">
          {weekLabel}
        </h3>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      {/* Vertical day cards */}
      <div className="space-y-3 overflow-y-auto max-h-[60vh] pb-4 scrollbar-thin">
        {weekDays.map((day, i) => {
          const hasItems = day.dayScheduled.length > 0 || day.dayEvents.length > 0;

          return (
            <motion.div
              key={day.dateStr}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`rounded-2xl p-4 ${DAY_COLORS[day.dayIndex]} ${
                day.today ? 'ring-2 ring-foreground/20 shadow-soft' : 'shadow-card'
              } transition-all`}
            >
              {/* Day header */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                  {format(day.date, 'EEEE')}
                </span>
                <span className="text-2xl font-serif text-foreground/80">
                  {format(day.date, 'd')}
                </span>
                <span className="text-xs text-foreground/50 uppercase">
                  {format(day.date, 'MMM')}
                </span>
                {day.today && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70 font-medium">
                    Today
                  </span>
                )}
              </div>

              {/* Items */}
              {hasItems ? (
                <div className="space-y-1.5">
                  {/* Completed events */}
                  {day.dayEvents.map(ev => {
                    const pat = patterns.find(p => p.id === ev.patternId);
                    return (
                      <div
                        key={ev.id}
                        className="flex items-center gap-2.5 py-1.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-foreground/15 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-foreground/70" />
                        </div>
                        <span className="text-sm text-foreground/50 line-through">
                          {pat?.name || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}

                  {/* Scheduled items — tappable to complete */}
                  {day.dayScheduled.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onDayClick(day.dateStr)}
                      className="flex items-center gap-2.5 py-1.5 w-full text-left group"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-foreground/25 group-hover:border-foreground/50 transition-colors shrink-0" />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        {s.pattern?.name || 'Unknown'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground/30 italic py-1">
                  {day.past ? 'Nothing logged' : 'Free day'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
