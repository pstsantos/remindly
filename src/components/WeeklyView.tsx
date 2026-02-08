import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import type { ScheduledOccurrence, Pattern, Path, PracticeEvent } from '@/types/fixation';

interface WeeklyViewProps {
  scheduled: ScheduledOccurrence[];
  patterns: Pattern[];
  paths: Path[];
  events: PracticeEvent[];
  onDayClick: (dateStr: string) => void;
}

export function WeeklyView({ scheduled, patterns, paths, events, onDayClick }: WeeklyViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
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
      const hasHeavy = dayEvents.some(e => e.fixationLevel === 'heavy');
      const hasMedium = dayEvents.some(e => e.fixationLevel === 'medium');
      return {
        date, dateStr, dayScheduled, dayEvents,
        isToday: dateStr === format(new Date(), 'yyyy-MM-dd'),
        intensity: hasHeavy ? 'heavy' : hasMedium ? 'medium' : dayEvents.length > 0 ? 'light' : 'none',
      };
    });
  }, [scheduled, patterns, paths, events]);

  return (
    <div className="px-6 grid grid-cols-7 gap-2">
      {weekDays.map((day, i) => (
        <motion.button
          key={day.dateStr}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onDayClick(day.dateStr)}
          className={`rounded-xl p-3 min-h-[100px] text-left transition-all ${
            day.isToday ? 'gradient-warm shadow-soft' : 'bg-card shadow-card hover:shadow-soft'
          }`}
        >
          <p className={`text-xs font-medium mb-1 ${day.isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
            {format(day.date, 'EEE')}
          </p>
          <p className={`text-lg font-serif ${day.isToday ? 'text-foreground' : 'text-foreground/70'}`}>
            {format(day.date, 'd')}
          </p>
          {day.intensity !== 'none' && (
            <div className={`w-2 h-2 rounded-full mt-1 ${
              day.intensity === 'heavy' ? 'fixation-heavy' :
              day.intensity === 'medium' ? 'fixation-medium' : 'fixation-light'
            }`} />
          )}
          {day.dayScheduled.slice(0, 2).map(s => (
            <div key={s.id} className="mt-1">
              <p className="text-[10px] text-foreground/60 truncate">
                {s.pattern?.name}
              </p>
            </div>
          ))}
          {day.dayScheduled.length > 2 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              +{day.dayScheduled.length - 2}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  );
}
