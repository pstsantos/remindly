import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart3, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfileDrawer } from '@/components/ProfileDrawer';

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
  const [view, setView] = useState<ViewMode>('weekly');
  const [logOpen, setLogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const store = useFixationStore();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = profile.nickname || user?.email?.split('@')[0] || 'You';

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

  const handleLog = async (patternId: string, problemName?: string, date?: string, practiceSetCount?: number) => {
    const result = await store.logPractice(patternId, 'medium', 'medium', problemName, date, practiceSetCount);
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
    <div className="min-h-screen max-w-2xl mx-auto relative pb-24 px-4 md:px-0 md:py-8 md:my-4 md:rounded-2xl md:border md:border-foreground/10 md:shadow-soft md:bg-white/10 md:backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6">
        <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 group">
          <Avatar className="w-8 h-8 border border-foreground/10">
            {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="You" /> : null}
            <AvatarFallback className="text-xs bg-secondary text-foreground">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors hidden sm:inline">
            {displayName}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              store.resetForTesting();
              toast('Reset complete.', { description: 'Logs and schedule cleared. Patterns kept.' });
            }}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Reset for testing"
            title="Reset logs (testing)"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Progress"
          >
            <BarChart3 className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <AffirmationHeader />

      {/* View switcher */}
      <div className="mb-6">
        <ViewSwitcher view={view} onChange={setView} />
      </div>

      {/* Views */}
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
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full glass-strong text-foreground shadow-soft flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Log dialog */}
      <LogPracticeDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        paths={store.paths}
        patterns={store.patterns}
        onAddPath={async (name) => await store.addPath(name)}
        onAddPattern={async (name, pathId, count) => await store.addPattern(name, pathId, count)}
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
      {/* Profile drawer */}
      <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default Index;
