import type { Pattern, Problem } from '@/types/fixation';

interface ProgressIconsProps {
  pattern: Pattern;
  problems: Problem[];
  compact?: boolean;
}

export function ProgressIcons({ pattern, problems, compact = false }: ProgressIconsProps) {
  const total = pattern.practiceSetCount || 5;
  const filled = Math.min(problems.length, total);
  const isComplete = filled >= total;

  return (
    <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`inline-block ${compact ? 'text-xs' : 'text-sm'} ${
            i < filled ? 'opacity-100' : 'opacity-25'
          }`}
        >
          {i < filled ? '●' : '○'}
        </span>
      ))}
      {isComplete && !compact && (
        <span className="ml-1 text-xs text-muted-foreground">stable</span>
      )}
    </div>
  );
}
