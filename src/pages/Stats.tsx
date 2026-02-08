import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { useFixationStore } from '@/hooks/useFixationStore';
import { ProgressIcons } from '@/components/ProgressIcons';
import { PatternPills } from '@/components/PatternPills';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Stats = () => {
  const navigate = useNavigate();
  const store = useFixationStore();

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
    return { totalProblems, activeCount, maintenanceCount };
  }, [store.problems, patternDetails]);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-2xl text-foreground">Progress</h1>
      </div>

      {/* Quiet intro */}
      <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
        A quiet overview of what you've practiced and where each pattern stands.
      </p>

      {/* Light aggregates */}
      {patternDetails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-6 mb-6 flex gap-4"
        >
          <AggregateChip label="Problems" value={aggregates.totalProblems} />
          <AggregateChip label="Active" value={aggregates.activeCount} />
          <AggregateChip label="Maintenance" value={aggregates.maintenanceCount} />
        </motion.div>
      )}

      {/* Pattern cards */}
      {patternDetails.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No patterns yet. Tap + on the home screen to begin.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="px-6">
          {patternDetails.map(({ pattern, path, problems, status }, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AccordionItem value={pattern.id} className="border-b border-border">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex flex-col items-start gap-2 text-left pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-medium text-foreground">
                        {pattern.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          status === 'Active'
                            ? 'border-border text-muted-foreground bg-secondary'
                            : 'border-border text-muted-foreground bg-muted'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <PatternPills path={path} />
                    <ProgressIcons pattern={pattern} problems={problems} />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2">
                    {problems.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No problems logged yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {problems.map((problem, i) => (
                          <li
                            key={problem.id}
                            className="flex items-baseline justify-between text-sm"
                          >
                            <span className="text-foreground">• {problem.name}</span>
                            <div className="flex items-baseline gap-2 ml-3 shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(problem.date + 'T00:00:00'), 'MMM d')}
                              </span>
                              <span className="text-[11px] text-muted-foreground/70">
                                {i + 1}/{problems.length}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      )}
    </div>
  );
};

function AggregateChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 shadow-card text-center">
      <p className="text-lg font-medium text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default Stats;
