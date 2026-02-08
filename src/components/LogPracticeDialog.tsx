import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Path, Pattern } from '@/types/fixation';
import { Check, ArrowRight, Plus } from 'lucide-react';

interface LogPracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paths: Path[];
  patterns: Pattern[];
  onAddPath: (name: string) => Path;
  onAddPattern: (name: string, pathId: string) => Pattern;
  onLog: (patternId: string, difficulty: 'easy' | 'medium' | 'hard', fixation: 'light' | 'medium' | 'heavy') => void;
}

type Step = 1 | 2 | 3;

export function LogPracticeDialog({
  open, onOpenChange, paths, patterns, onAddPath, onAddPattern, onLog
}: LogPracticeDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedPatternId, setSelectedPatternId] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [newPatternName, setNewPatternName] = useState('');
  const [newPathName, setNewPathName] = useState('');
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [showNewPath, setShowNewPath] = useState(paths.length === 0);
  const [showNewPattern, setShowNewPattern] = useState(patterns.length === 0);

  const reset = () => {
    setStep(1);
    setSelectedPatternId('');
    setSelectedDifficulty(null);
    setNewPatternName('');
    setNewPathName('');
    setSelectedPathId('');
    setShowNewPath(paths.length === 0);
    setShowNewPattern(patterns.length === 0);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleCreateAndSelect = () => {
    let pathId = selectedPathId;
    if (showNewPath && newPathName.trim()) {
      const p = onAddPath(newPathName.trim());
      pathId = p.id;
    }
    // Auto-create a default path if none exists and none entered
    if (!pathId && paths.length === 0 && !newPathName.trim()) {
      const p = onAddPath('General');
      pathId = p.id;
    }
    if (!pathId) return;
    if (newPatternName.trim()) {
      const pat = onAddPattern(newPatternName.trim(), pathId);
      setSelectedPatternId(pat.id);
      setShowNewPattern(false);
      setStep(2);
    }
  };

  const handleSelectExisting = (patternId: string) => {
    setSelectedPatternId(patternId);
    setStep(2);
  };

  const handleDifficulty = (d: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(d);
    setStep(3);
  };

  const handleFixation = (f: 'light' | 'medium' | 'heavy') => {
    if (!selectedPatternId || !selectedDifficulty) return;
    onLog(selectedPatternId, selectedDifficulty, f);
    handleClose(false);
  };

  const filteredPatterns = selectedPathId
    ? patterns.filter(p => p.pathId === selectedPathId)
    : patterns;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {step === 1 && 'Log Practice'}
            {step === 2 && 'How difficult?'}
            {step === 3 && 'How hard to stabilize?'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === 1 && 'Select or create a pattern to log.'}
            {step === 2 && 'Rate the objective difficulty.'}
            {step === 3 && 'How hard was this to mentally stabilize?'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
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

              {/* Pattern select */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Pattern</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredPatterns.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectExisting(p.id)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {!showNewPattern ? (
                  <button
                    onClick={() => setShowNewPattern(true)}
                    className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New pattern
                  </button>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={newPatternName}
                      onChange={e => setNewPatternName(e.target.value)}
                      placeholder="e.g. Binary Tree — Right Side View"
                      className="rounded-xl flex-1"
                    />
                    <Button
                      onClick={handleCreateAndSelect}
                      disabled={!newPatternName.trim() || (!selectedPathId && !newPathName.trim() && paths.length > 0)}
                      size="sm"
                      className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => handleDifficulty(d)}
                  className="w-full px-5 py-4 rounded-xl bg-secondary hover:bg-secondary/70 transition-all text-left capitalize text-lg font-serif"
                >
                  {d}
                </button>
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground mb-4">
                How hard was this to mentally stabilize?
              </p>
              {([
                { level: 'light' as const, emoji: '🟢', label: 'Light' },
                { level: 'medium' as const, emoji: '🟡', label: 'Medium' },
                { level: 'heavy' as const, emoji: '🔴', label: 'Heavy' },
              ]).map(({ level, emoji, label }) => (
                <button
                  key={level}
                  onClick={() => handleFixation(level)}
                  className="w-full px-5 py-4 rounded-xl bg-secondary hover:bg-secondary/70 transition-all text-left flex items-center gap-3"
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-lg font-serif">{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
