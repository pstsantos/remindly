import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScheduledOccurrence, PracticeEvent } from '@/types/fixation';

interface MonthlyViewProps {
  scheduled: ScheduledOccurrence[];
  events: PracticeEvent[];
  onDayClick: (dateStr: string) => void;
}

export function MonthlyView({ scheduled, events, onDayClick }: MonthlyViewProps) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { days, padding } = useMemo(() => {
    const start = startOfMonth(displayMonth);
    const end = endOfMonth(displayMonth);
    const allDays = eachDayOfInterval({ start, end });

    const daysWithData = allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const scheduledCount = scheduled.filter(s => s.date === dateStr).length;
      const eventCount = events.filter(e => e.date === dateStr).length;
      const hasCompleted = eventCount > 0;
      const totalItems = scheduledCount + eventCount;
      const intensity = totalItems >= 3 ? 3 : totalItems >= 2 ? 2 : totalItems >= 1 ? 1 : 0;
      return { date, dateStr, intensity, hasCompleted, isToday: dateStr === todayStr };
    });

    const firstDayOfWeek = getDay(start);
    const padding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return { days: daysWithData, padding };
  }, [scheduled, events, displayMonth, todayStr]);

  const intensityColors = [
    'bg-secondary',
    'bg-accent/30',
    'bg-accent/60',
    'bg-primary/70',
  ];

  const handlePrev = () => setDisplayMonth(prev => subMonths(prev, 1));
  const handleNext = () => setDisplayMonth(prev => addMonths(prev, 1));

  return (
    <div className="px-6 glass rounded-2xl py-5 mx-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-foreground/70" />
        </button>
        <h3 className="text-xl font-serif text-foreground">
          {format(displayMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <p key={i} className="text-center text-xs text-muted-foreground py-1">{d}</p>
        ))}
        {Array.from({ length: padding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day, i) => (
          <motion.button
            key={day.dateStr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.01 }}
            onClick={() => onDayClick(day.dateStr)}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/20 glass ${
              day.isToday ? 'ring-2 ring-primary' : ''
            }`}
          >
            <span>{format(day.date, 'd')}</span>
            {day.intensity > 0 && (
              <span className="flex gap-0.5 mt-0.5">
                {day.intensity >= 1 && <span className={`w-1.5 h-1.5 rounded-full ${day.hasCompleted ? 'bg-primary' : 'bg-foreground/30'}`} />}
                {day.intensity >= 2 && <span className={`w-1.5 h-1.5 rounded-full ${day.hasCompleted ? 'bg-primary' : 'bg-foreground/30'}`} />}
                {day.intensity >= 3 && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
