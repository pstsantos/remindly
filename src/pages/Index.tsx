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
import { DeletePatternDialog } from '@/components/DeletePatternDialog';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { WeeklyView } from '@/components/WeeklyView';
import { MonthlyView } from '@/components/MonthlyView';
import { DayDetailSheet } from '@/components/DayDetailSheet';

const Index = () => {
  const [view, setView] = useState<ViewMode>('daily');
  const [logOpen, setLogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const store = useFixationStore();

  const todayItems = store.getTodayScheduled();
  const todayItem = todayItems[0];

  const handleMarkPracticed = () => {
    if (!todayItem?.pattern) return;
    setLogOpen(true);
  };

  const handleSkip = (patternId?: string) => {
    const id = patternId || todayItem?.patternId;
    if (!id) return;
    store.skipToday(id);
    toast('Rescheduled for tomorrow.', {
      description: 'No pressure. It\'ll be here when you\'re ready.',
    });
  };

  const handleLog = (patternId: string, difficulty: 'easy' | 'medium' | 'hard', fixation: 'light' | 'medium' | 'heavy', problemName?: string) => {
    const result = store.logPractice(patternId, difficulty, fixation, problemName);
    toast('Practice logged ✓', {
      description: `Next revisit booked: ${format(new Date(result.occurrence.date + 'T00:00:00'), 'MMM d')}`,
    });
    setSelectedDay(null);
  };

  const handleDeleteRequest = (patternId: string) => {
    const pattern = store.patterns.find(p => p.id === patternId);
    if (pattern) setDeleteTarget({ id: patternId, name: pattern.name });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    store.deletePattern(deleteTarget.id);
    toast('Pattern deleted.', { description: 'All future revisits removed.' });
    setDeleteTarget(null);
    setSelectedDay(null);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
  };

  // Build day detail items
  const dayDetailItems = selectedDay ? [
    ...store.getScheduledForDate(selectedDay).map(s => ({
      patternId: s.patternId,
      pattern: s.pattern,
      path: s.path,
      type: 'scheduled' as const,
    })),
    ...store.getEventsForDate(selectedDay).map(e => ({
      patternId: e.patternId,
      pattern: e.pattern,
      path: e.path,
      type: 'completed' as const,
      event: e,
    })),
  ] : [];

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
              problems={store.getProblemsForPattern(todayItem.patternId)}
              onMarkPracticed={handleMarkPracticed}
              onSkip={() => handleSkip()}
              onDelete={() => handleDeleteRequest(todayItem.patternId)}
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
          events={store.events}
          onDayClick={handleDayClick}
        />
      )}

      {view === 'monthly' && (
        <MonthlyView
          scheduled={store.scheduled}
          events={store.events}
          onDayClick={handleDayClick}
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
        onAddPattern={(name, pathId, count) => store.addPattern(name, pathId, count)}
        onLog={handleLog}
        onDelete={handleDeleteRequest}
      />

      {/* Delete confirmation */}
      <DeletePatternDialog
        open={!!deleteTarget}
        patternName={deleteTarget?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Day detail sheet */}
      <DayDetailSheet
        date={selectedDay}
        items={dayDetailItems}
        onClose={() => setSelectedDay(null)}
        onLogNow={(patternId) => {
          setSelectedDay(null);
          setLogOpen(true);
        }}
        onSkip={(patternId) => {
          handleSkip(patternId);
          setSelectedDay(null);
        }}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
};

export default Index;
