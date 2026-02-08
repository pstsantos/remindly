import type { Path } from '@/types/fixation';

interface PatternPillsProps {
  path?: Path;
  className?: string;
}

export function PatternPills({ path, className = '' }: PatternPillsProps) {
  if (!path) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground border border-border">
        {path.name}
      </span>
    </div>
  );
}
