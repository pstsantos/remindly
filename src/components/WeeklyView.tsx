import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScheduledOccurrence, Pattern, Path, PracticeEvent } from '@/types/fixation';
interface WeeklyViewProps {
  scheduled: ScheduledOccurrence[];
  patterns: Pattern[];
  paths: Path[];
  events: PracticeEvent[];
  onDayClick: (dateStr: string) => void;
}
export function WeeklyView({
  scheduled,
  patterns,
  paths,
  events,
  onDayClick
}: WeeklyViewProps) {
  const [displayWeek, setDisplayWeek] = useState(() => new Date());
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekDays = useMemo(() => {
    const start = startOfWeek(displayWeek, {
      weekStartsOn: 1
    });
    return Array.from({
      length: 7
    }, (_, i) => {
      const date = addDays(start, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayScheduled = scheduled.filter(s => s.date === dateStr).map(s => ({
        ...s,
        pattern: patterns.find(p => p.id === s.patternId),
        path: paths.find(pa => pa.id === patterns.find(p => p.id === s.patternId)?.pathId)
      }));
      const dayEvents = events.filter(e => e.date === dateStr);
      const hasHeavy = dayEvents.some(e => e.fixationLevel === 'heavy');
      const hasMedium = dayEvents.some(e => e.fixationLevel === 'medium');
      return {
        date,
        dateStr,
        dayScheduled,
        dayEvents,
        isToday: dateStr === todayStr,
        intensity: hasHeavy ? 'heavy' : hasMedium ? 'medium' : dayEvents.length > 0 ? 'light' : 'none'
      };
    });
  }, [scheduled, patterns, paths, events, displayWeek, todayStr]);
  const handlePrev = () => setDisplayWeek(prev => subWeeks(prev, 1));
  const handleNext = () => setDisplayWeek(prev => addWeeks(prev, 1));

  // Week range label
  const weekStart = startOfWeek(displayWeek, {
    weekStartsOn: 1
  });
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = format(weekStart, 'MMM d') + ' – ' + format(weekEnd, 'MMM d, yyyy');
  return <div className="px-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Previous week">
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <h3 className="font-medium text-foreground/80 text-2xl">
          {weekLabel}
        </h3>
        <button onClick={handleNext} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Next week">
          <ChevronRight className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {weekDays.map((day, i) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onDayClick(day.dateStr)}
            className={`rounded-xl p-4 text-left transition-all flex items-center gap-4 ${
              day.isToday
                ? 'glass-strong ring-1 ring-primary/30 shadow-soft'
                : 'glass hover:shadow-soft'
            }`}
          >
            {/* Day & date */}
            <div className="w-16 shrink-0">
              <p className={`text-xs font-medium ${day.isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                {format(day.date, 'EEE')}
              </p>
              <p className={`text-2xl font-serif ${day.isToday ? 'text-foreground' : 'text-foreground/70'}`}>
                {format(day.date, 'd')}
              </p>
            </div>

            {/* Divider */}
            <div className={`w-px self-stretch ${day.isToday ? 'bg-foreground/15' : 'bg-foreground/10'}`} />

            {/* Items */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {day.dayScheduled.length === 0 && day.dayEvents.length === 0 && (
                <p className="text-xs text-muted-foreground/50 italic">No items</p>
              )}
              {day.dayEvents.map((e, idx) => (
                <p key={`ev-${idx}`} className="text-xs text-foreground/70 truncate">
                  ✓ <span className="line-through">{patterns.find(p => p.id === e.patternId)?.name}</span>
                </p>
              ))}
              {day.dayScheduled.slice(0, 3).map(s => (
                <p key={s.id} className="text-xs text-foreground/60 truncate">
                  ○ {s.pattern?.name}
                </p>
              ))}
              {day.dayScheduled.length > 3 && (
                <p className="text-[10px] text-muted-foreground">+{day.dayScheduled.length - 3} more</p>
              )}
            </div>

            {/* Intensity dot */}
            {day.intensity !== 'none' && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                day.intensity === 'heavy' ? 'fixation-heavy' : day.intensity === 'medium' ? 'fixation-medium' : 'fixation-light'
              }`} />
            )}
          </motion.button>
        ))}
      </div>
    </div>;
}