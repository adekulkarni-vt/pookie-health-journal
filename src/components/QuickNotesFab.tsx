'use client';

import { useState, useRef, useEffect } from 'react';
import { StickyNote, Loader2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function QuickNotesFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      if (res.ok) {
        setInput('');
        toast('Note captured', 'success');
        setOpen(false);
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save note', 'error');
      }
    } catch {
      toast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
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
          <div className="w-72 rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <StickyNote className="h-4 w-4 text-pastel-pink" />
                Quick Note
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="e.g. Ate kokum, mild flare..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pastel-pink"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !input.trim()}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    saving || !input.trim()
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-dark-pink text-white hover:bg-dark-pink/90'
                  )}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
            open
              ? 'bg-muted text-muted-foreground rotate-45'
              : 'bg-dark-pink text-white hover:bg-dark-pink/90 hover:shadow-xl active:scale-95'
          )}
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <StickyNote className="h-6 w-6" />
          )}
        </button>
      </div>
    </>
  );
}
