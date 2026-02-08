import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { ScheduledOccurrence, Pattern, Path, PracticeEvent } from '@/types/fixation';

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
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <h3 className="text-sm font-medium text-foreground/80">
          {weekLabel}
        </h3>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      {/* Vertical day cards */}
      <div className="space-y-3 overflow-y-auto max-h-[60vh] pb-4">
        {weekDays.map((day, i) => {
          const hasItems = day.dayScheduled.length > 0 || day.dayEvents.length > 0;

          return (
            <motion.div
              key={day.dateStr}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`glass rounded-2xl p-4 ${
                day.today ? 'ring-1 ring-white/30' : ''
              }`}
            >
              <div className="flex items-stretch gap-0">
                {/* Left: day name + date */}
                <div className="flex flex-col justify-center min-w-[90px] pr-4">
                  <span className="text-xs font-medium uppercase tracking-widest text-foreground/50">
                    {format(day.date, 'EEEE')}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-4xl font-serif leading-none text-foreground/85">
                      {format(day.date, 'd')}
                    </span>
                    <span className="text-sm font-medium uppercase text-foreground/40">
                      {format(day.date, 'MMM')}
                    </span>
                  </div>
                  {day.today && (
                    <span className="mt-1.5 text-[10px] font-medium text-foreground/50">
                      Today
                    </span>
                  )}
                </div>

                {/* Divider */}
                {hasItems && (
                  <div className="w-px bg-foreground/10 mx-2 self-stretch" />
                )}

                {/* Right: to-do items */}
                <div className="flex-1 flex flex-col justify-center gap-1.5 pl-2">
                  {/* Completed events */}
                  {day.dayEvents.map(ev => {
                    const pat = patterns.find(p => p.id === ev.patternId);
                    return (
                      <div key={ev.id} className="flex items-center gap-2">
                        <div className="w-4.5 h-4.5 rounded-full bg-foreground/12 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-foreground/60" />
                        </div>
                        <span className="text-sm text-foreground/40 line-through truncate">
                          {pat?.name || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}

                  {/* Scheduled items */}
                  {day.dayScheduled.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onDayClick(day.dateStr)}
                      className="flex items-center gap-2 group w-full text-left"
                    >
                      <div className="w-4.5 h-4.5 rounded-full border-[1.5px] border-foreground/20 group-hover:border-foreground/50 transition-colors shrink-0" />
                      <span className="text-sm text-foreground/75 group-hover:text-foreground transition-colors truncate">
                        {s.pattern?.name || 'Unknown'}
                      </span>
                    </button>
                  ))}

                  {!hasItems && (
                    <span className="text-xs text-foreground/25 italic">
                      {day.past ? 'Nothing logged' : 'Free day'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
