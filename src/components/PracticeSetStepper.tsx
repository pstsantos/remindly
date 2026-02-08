import { Minus, Plus } from 'lucide-react';

interface PracticeSetStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export function PracticeSetStepper({ value, onChange }: PracticeSetStepperProps) {
  const presets = [3, 5, 7];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Practice sets
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, value - 1))}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(20, value + 1))}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        {presets.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              value === p
                ? 'bg-foreground text-background border-foreground'
                : 'bg-secondary text-secondary-foreground border-border hover:border-foreground/30'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Practice sets represent how many problems you want to complete under this pattern before spacing stabilizes.
      </p>
    </div>
  );
}
