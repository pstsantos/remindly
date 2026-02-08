import type { ViewMode } from '@/types/fixation';

interface ViewSwitcherProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const views: { key: ViewMode; label: string }[] = [
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
  ];

  return (
    <div className="flex mx-6 glass rounded-full p-1 gap-1">
      {views.map(v => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={`flex-1 py-2 text-sm rounded-full font-medium transition-all ${
            view === v.key
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
