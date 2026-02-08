import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import type { ScheduledOccurrence, PracticeEvent } from '@/types/fixation';

interface MonthlyViewProps {
  scheduled: ScheduledOccurrence[];
  events: PracticeEvent[];
}

export function MonthlyView({ scheduled, events }: MonthlyViewProps) {
  const { days, monthLabel } = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const allDays = eachDayOfInterval({ start, end });

    const daysWithData = allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const scheduledCount = scheduled.filter(s => s.date === dateStr).length;
      const eventCount = events.filter(e => e.date === dateStr).length;
      const heavyEvents = events.filter(e => e.date === dateStr && e.fixationLevel === 'heavy').length;
      const intensity = heavyEvents > 0 ? 3 : eventCount > 0 ? 2 : scheduledCount > 0 ? 1 : 0;
      return { date, dateStr, intensity, isToday: dateStr === format(new Date(), 'yyyy-MM-dd') };
    });

    // Pad start for alignment
    const firstDayOfWeek = getDay(start);
    const padding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return { days: daysWithData, monthLabel: format(now, 'MMMM yyyy'), padding };
  }, [scheduled, events]);

  const firstDayOfWeek = getDay(startOfMonth(new Date()));
  const padding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const intensityColors = [
    'bg-secondary',
    'bg-accent/30',
    'bg-accent/60',
    'bg-primary/70',
  ];

  return (
    <div className="px-6">
      <h3 className="text-xl font-serif text-foreground mb-4">{days.length > 0 ? format(days[0].date, 'MMMM yyyy') : ''}</h3>
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <p key={i} className="text-center text-xs text-muted-foreground py-1">{d}</p>
        ))}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day, i) => (
          <motion.div
            key={day.dateStr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-colors ${
              intensityColors[day.intensity]
            } ${day.isToday ? 'ring-2 ring-primary' : ''}`}
          >
            {format(day.date, 'd')}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
