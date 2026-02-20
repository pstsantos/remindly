import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, LogOut, Pencil, Check, X, Trophy, Target, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFixationStore } from '@/hooks/useFixationStore';
import { ProgressIcons } from '@/components/ProgressIcons';
import { PatternPills } from '@/components/PatternPills';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { user, signOut } = useAuth();
  const { profile, updateNickname, uploadAvatar } = useProfile();
  const store = useFixationStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const displayName = profile.nickname || user?.email?.split('@')[0] || 'You';

  const startEdit = () => {
    setDraft(profile.nickname || '');
    setEditing(true);
  };

  const saveNickname = async () => {
    if (draft.trim()) {
      await updateNickname(draft.trim());
      toast.success('Nickname updated');
    }
    setEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
    toast.success('Photo updated');
  };

  // Stats / leaderboard data
  const patternDetails = useMemo(() => {
    return store.patterns.map((pattern) => {
      const path = store.paths.find((p) => p.id === pattern.pathId);
      const problems = store.getProblemsForPattern(pattern.id);
      const isComplete = problems.length >= pattern.practiceSetCount;
      return { pattern, path, problems, status: isComplete ? 'Maintenance' : 'Active' };
    });
  }, [store.patterns, store.paths, store.problems, store.getProblemsForPattern]);

  const aggregates = useMemo(() => {
    const totalProblems = store.problems.length;
    const activeCount = patternDetails.filter((d) => d.status === 'Active').length;
    const maintenanceCount = patternDetails.filter((d) => d.status === 'Maintenance').length;
    const totalEvents = store.events.length;
    return { totalProblems, activeCount, maintenanceCount, totalEvents };
  }, [store.problems, store.events, patternDetails]);

  // Streak calculation
  const streak = useMemo(() => {
    if (store.events.length === 0) return 0;
    const dates = [...new Set(store.events.map(e => e.date))].sort().reverse();
    const today = format(new Date(), 'yyyy-MM-dd');
    let count = 0;
    let checkDate = today;
    for (const d of dates) {
      if (d === checkDate || d === format(new Date(new Date(checkDate).getTime() - 86400000), 'yyyy-MM-dd')) {
        count++;
        checkDate = d;
      } else if (d < checkDate) {
        break;
      }
    }
    return count;
  }, [store.events]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 border-none bg-transparent">
        <div className="h-full overflow-y-auto glass-strong rounded-r-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>

          {/* Profile header */}
          <div className="flex flex-col items-center pt-10 pb-6 px-6">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-2 border-foreground/10 shadow-soft">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Your avatar" />
                ) : null}
                <AvatarFallback className="text-2xl bg-secondary text-foreground">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full glass-strong hover:bg-secondary transition-colors"
                aria-label="Change photo"
              >
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Nickname */}
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-8 w-40 text-center glass border-foreground/10"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                />
                <button onClick={saveNickname} className="p-1 rounded-full hover:bg-secondary">
                  <Check className="w-4 h-4 text-foreground" />
                </button>
                <button onClick={() => setEditing(false)} className="p-1 rounded-full hover:bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 group"
              >
                <h2 className="text-2xl text-foreground">{displayName}</h2>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
          </div>

          {/* Race against yourself — stats */}
          <div className="px-6 pb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your race</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard icon={<Zap className="w-4 h-4" />} label="Streak" value={`${streak}d`} />
              <StatCard icon={<Target className="w-4 h-4" />} label="Sessions" value={aggregates.totalEvents} />
              <StatCard icon={<Trophy className="w-4 h-4" />} label="Mastered" value={aggregates.maintenanceCount} />
            </div>
            <div className="flex gap-3 mb-6">
              <MiniChip label="Problems" value={aggregates.totalProblems} />
              <MiniChip label="Active" value={aggregates.activeCount} />
              <MiniChip label="Maintenance" value={aggregates.maintenanceCount} />
            </div>
          </div>

          {/* Pattern breakdown */}
          {patternDetails.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Pattern progress</p>
              <Accordion type="single" collapsible className="glass rounded-2xl py-1 px-1">
                {patternDetails.map(({ pattern, path, problems, status }) => (
                  <AccordionItem key={pattern.id} value={pattern.id} className="border-b border-border/30">
                    <AccordionTrigger className="hover:no-underline py-4 px-3">
                      <div className="flex flex-col items-start gap-1.5 text-left pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{pattern.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            status === 'Active'
                              ? 'border-border text-muted-foreground bg-secondary'
                              : 'border-border text-muted-foreground bg-muted'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <PatternPills path={path} />
                        <ProgressIcons pattern={pattern} problems={problems} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pb-2 px-3">
                        {problems.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No problems logged yet.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {problems.map((problem, i) => (
                              <li key={problem.id} className="flex items-center justify-between text-xs">
                                <span className="text-foreground">• {problem.name}</span>
                                <span className="text-muted-foreground">
                                  {format(new Date(problem.date + 'T00:00:00'), 'MMM d')}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Sign out */}
          <div className="px-6 pb-10">
            <button
              onClick={() => {
                signOut();
                onOpenChange(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl px-3 py-3 text-center"
    >
      <div className="flex justify-center text-accent mb-1">{icon}</div>
      <p className="text-lg font-medium text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function MiniChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-lg px-2 py-2 text-center glass">
      <p className="text-sm font-medium text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
