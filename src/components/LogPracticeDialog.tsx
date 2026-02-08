import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Path, Pattern } from '@/types/fixation';
import { Plus, Search, Trash2, CalendarIcon, Check } from 'lucide-react';
import { PracticeSetStepper } from '@/components/PracticeSetStepper';
import { PatternPills } from '@/components/PatternPills';
import { format, subDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface LogPracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paths: Path[];
  patterns: Pattern[];
  onAddPath: (name: string) => Path;
  onAddPattern: (name: string, pathId: string, practiceSetCount?: number) => Pattern;
  onLog: (patternId: string, problemName?: string, date?: string) => void;
  onDelete?: (patternId: string) => void;
}

export function LogPracticeDialog({
  open, onOpenChange, paths, patterns, onAddPath, onAddPattern, onLog, onDelete
}: LogPracticeDialogProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string>('');
  const [newPatternName, setNewPatternName] = useState('');
  const [newPathName, setNewPathName] = useState('');
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [showNewPath, setShowNewPath] = useState(paths.length === 0);
  const [showNewPattern, setShowNewPattern] = useState(patterns.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [practiceSetCount, setPracticeSetCount] = useState(5);
  const [problemName, setProblemName] = useState('');
  const [practiceDate, setPracticeDate] = useState<Date>(new Date());

  const reset = () => {
    setSelectedPatternId('');
    setNewPatternName('');
    setNewPathName('');
    setSelectedPathId('');
    setShowNewPath(paths.length === 0);
    setShowNewPattern(patterns.length === 0);
    setSearchQuery('');
    setPracticeSetCount(5);
    setProblemName('');
    setPracticeDate(new Date());
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleCreatePattern = () => {
    let pathId = selectedPathId;
    if (showNewPath && newPathName.trim()) {
      const p = onAddPath(newPathName.trim());
      pathId = p.id;
      setSelectedPathId(pathId);
      setShowNewPath(false);
      setNewPathName('');
    }
    if (!pathId && paths.length === 0 && !newPathName.trim()) {
      const p = onAddPath('General');
      pathId = p.id;
      setSelectedPathId(pathId);
    }
    if (!pathId || !newPatternName.trim()) return;
    const pat = onAddPattern(newPatternName.trim(), pathId, practiceSetCount);
    setSelectedPatternId(pat.id);
    setShowNewPattern(false);
    setNewPatternName('');
    setPracticeSetCount(5);
  };

  const handleSubmit = () => {
    if (!selectedPatternId) return;
    const dateStr = format(practiceDate, 'yyyy-MM-dd');
    onLog(selectedPatternId, problemName.trim() || undefined, dateStr);
    handleClose(false);
  };

  const today = startOfDay(new Date());
  const earliestDate = subDays(today, 14);
  const isBackdated = format(practiceDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');

  const filteredPatterns = useMemo(() => {
    let result = selectedPathId
      ? patterns.filter(p => p.pathId === selectedPathId)
      : patterns;

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lower));
    }

    return result.sort((a, b) => b.successCount - a.successCount);
  }, [patterns, selectedPathId, searchQuery]);

  const selectedPattern = patterns.find(p => p.id === selectedPatternId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Log Practice</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select a pattern, name the problem, and log.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Date selector */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    isBackdated && "text-foreground border-accent"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {format(practiceDate, 'EEEE, MMM d')}
                  {!isBackdated && (
                    <span className="ml-1 text-muted-foreground text-xs">(today)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={practiceDate}
                  onSelect={(d) => d && setPracticeDate(d)}
                  disabled={(date) => date > today || date < earliestDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Path filter */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Path</Label>
            <div className="flex flex-wrap gap-2">
              {paths.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPathId(p.id); setShowNewPath(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selectedPathId === p.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-secondary text-secondary-foreground border-border hover:border-foreground/30'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => setShowNewPath(true)}
                className="px-3 py-1.5 rounded-full text-sm border border-dashed border-border text-muted-foreground hover:border-foreground/30 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            {showNewPath && (
              <Input
                value={newPathName}
                onChange={e => setNewPathName(e.target.value)}
                placeholder="e.g. LeetCode — Trees"
                className="mt-2 rounded-xl"
              />
            )}
          </div>

          {/* Pattern search */}
          {patterns.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patterns…"
                className="rounded-xl pl-9"
              />
            </div>
          )}

          {/* Pattern select */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Pattern</Label>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {filteredPatterns.map(p => {
                const path = paths.find(pa => pa.id === p.pathId);
                const isSelected = selectedPatternId === p.id;
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPatternId(p.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedPatternId(p.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl transition-colors group cursor-pointer",
                      isSelected
                        ? "bg-foreground/10 border border-foreground/20"
                        : "bg-secondary hover:bg-secondary/80 border border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-foreground shrink-0" />}
                          <span className="text-sm block">{p.name}</span>
                        </div>
                        <PatternPills path={path} className="mt-1" />
                      </div>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(p.id);
                            handleClose(false);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors shrink-0 ml-2"
                          title="Delete pattern"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredPatterns.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground py-2 text-center">No patterns found</p>
              )}
            </div>
            {!showNewPattern ? (
              <button
                onClick={() => setShowNewPattern(true)}
                className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" /> New pattern
              </button>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newPatternName}
                    onChange={e => setNewPatternName(e.target.value)}
                    placeholder="e.g. Binary Tree — Right Side View"
                    className="rounded-xl flex-1"
                  />
                  <Button
                    onClick={handleCreatePattern}
                    disabled={!newPatternName.trim() || (!selectedPathId && !newPathName.trim() && paths.length > 0)}
                    size="sm"
                    className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <PracticeSetStepper value={practiceSetCount} onChange={setPracticeSetCount} />
              </div>
            )}
          </div>

          {/* Problem name */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
              Problem name <span className="normal-case text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              value={problemName}
              onChange={e => setProblemName(e.target.value)}
              placeholder="e.g. LeetCode #199"
              className="rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatternId}
            className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-serif"
          >
            Log Practice
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
