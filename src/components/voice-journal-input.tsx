'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface VoiceJournalInputProps {
  onTextChange?: (text: string) => void;
  placeholder?: string;
}

export function VoiceJournalInput({ onTextChange, placeholder }: VoiceJournalInputProps) {
  const { isListening, transcript, error, isSupported, startListening, stopListening } =
    useSpeechRecognition();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTranscriptRef = useRef('');
  const onChangeRef = useRef(onTextChange);
  onChangeRef.current = onTextChange;

  useEffect(() => {
    if (isListening) {
      if (transcript) {
        const delta = transcript.slice(lastTranscriptRef.current.length);
        if (delta) {
          setText((prev) => prev + delta);
        }
      }
      lastTranscriptRef.current = transcript;
    } else if (transcript && transcript !== lastTranscriptRef.current) {
      const delta = transcript.slice(lastTranscriptRef.current.length);
      if (delta) {
        setText((prev) => prev + delta);
      }
      lastTranscriptRef.current = '';
    } else {
      lastTranscriptRef.current = '';
    }
  }, [transcript, isListening]);

  useEffect(() => {
    onChangeRef.current?.(text);
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [text]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      lastTranscriptRef.current = '';
    } else {
      setText((prev) => (prev ? prev + ' ' : ''));
      lastTranscriptRef.current = '';
      startListening();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setText(next);
    onTextChange?.(next);
  };

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <MicOff className="h-5 w-5" />
          <p>Voice input is not supported in this browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleToggleMic}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-full transition-all',
              isListening
                ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30'
                : 'bg-pastel-pink text-gray-900 hover:bg-pastel-pink/80'
            )}
            title={isListening ? 'Stop recording' : 'Start recording'}
          >
            <Mic className="h-5 w-5" />
            {isListening && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
              </span>
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-card-foreground">
              {isListening ? 'Recording...' : 'Voice Journal'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isListening ? 'Tap mic to stop' : 'Tap mic to dictate'}
            </p>
          </div>
        </div>
        {isListening && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            <span className="text-xs text-destructive font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder || "How are you feeling today?"}
          className="min-h-[160px] sm:min-h-[200px] w-full resize-y rounded-lg border border-border bg-background p-3 sm:p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          rows={8}
        />
      </div>

      {error && (
        <div className="border-t border-border px-4 sm:px-5 py-3">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
