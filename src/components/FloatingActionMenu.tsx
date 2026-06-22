'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FloatingActionMenuProps {
  actions: ActionItem[];
}

export function FloatingActionMenu({ actions }: FloatingActionMenuProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (action: ActionItem) => {
    setOpen(false);
    action.onClick();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {open && (
          <div
            className="flex flex-col items-stretch gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleAction(action)}
                className={cn(
                  'flex items-center gap-3 rounded-xl bg-card px-5 py-3 text-sm font-medium text-foreground shadow-lg border border-border',
                  'hover:bg-accent transition-colors'
                )}
              >
                <span className="text-pastel-pink">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
            open
              ? 'bg-muted text-muted-foreground rotate-45'
              : 'bg-dark-pink text-white hover:bg-dark-pink/90 hover:shadow-xl active:scale-95'
          )}
        >
          <Plus className="h-6 w-6 transition-transform duration-200" />
        </button>
      </div>
    </>
  );
}
