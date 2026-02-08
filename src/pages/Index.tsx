import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import type { ViewMode } from '@/types/fixation';
import { useFixationStore } from '@/hooks/useFixationStore';
import { AffirmationHeader } from '@/components/AffirmationHeader';
import { TodayCard, EmptyTodayCard } from '@/components/TodayCard';
import { LogPracticeDialog } from '@/components/LogPracticeDialog';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { WeeklyView } from '@/components/WeeklyView';
import { MonthlyView } from '@/components/MonthlyView';

const Index = () => {
  const [view, setView] = useState<ViewMode>('daily');
  const [logOpen, setLogOpen] = useState(false);
  const store = useFixationStore();

  const todayItems = store.getTodayScheduled();
  const todayItem = todayItems[0]; // Show only one in daily view

  const handleMarkPracticed = () => {
    if (!todayItem?.pattern) return;
    setLogOpen(true);
  };

  const handleSkip = () => {
    if (!todayItem?.pattern) return;
    store.skipToday(todayItem.patternId);
    toast('Rescheduled for tomorrow.', {
      description: 'No pressure. It\'ll be here when you\'re ready.',
    });
  };

  const handleLog = (patternId: string, difficulty: 'easy' | 'medium' | 'hard', fixation: 'light' | 'medium' | 'heavy') => {
    const result = store.logPractice(patternId, difficulty, fixation);
    toast('Practice logged ✓', {
      description: `Next revisit booked: ${format(new Date(result.occurrence.date + 'T00:00:00'), 'MMM d')}`,
    });
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative pb-24">
      {/* Date pill */}
      <div className="flex justify-center pt-6">
        <div className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground bg-card shadow-card">
          {format(new Date(), 'EEEE, d MMMM')}
        </div>
      </div>

      <AffirmationHeader />

      {/* View switcher */}
      <div className="mb-6">
        <ViewSwitcher view={view} onChange={setView} />
      </div>

      {/* Views */}
      {view === 'daily' && (
        <div>
          {todayItem?.pattern ? (
            <TodayCard
              pattern={todayItem.pattern}
              path={todayItem.path}
              onMarkPracticed={handleMarkPracticed}
              onSkip={handleSkip}
            />
          ) : (
            <EmptyTodayCard />
          )}

          {todayItems.length > 1 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              +{todayItems.length - 1} more scheduled — see weekly view
            </p>
          )}
        </div>
      )}

      {view === 'weekly' && (
        <WeeklyView
          scheduled={store.scheduled}
          patterns={store.patterns}
          paths={store.paths}
        />
      )}

      {view === 'monthly' && (
        <MonthlyView
          scheduled={store.scheduled}
          events={store.events}
        />
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLogOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-foreground text-background shadow-soft flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Log dialog */}
      <LogPracticeDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        paths={store.paths}
        patterns={store.patterns}
        onAddPath={(name) => store.addPath(name)}
        onAddPattern={(name, pathId) => store.addPattern(name, pathId)}
        onLog={handleLog}
      />
    </div>
  );
};

export default Index;
