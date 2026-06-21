'use client';

import { useState, useRef, useEffect } from 'react';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 10;

interface PhotoPreview {
  id: string;
  file: File;
  preview: string;
}

interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return photos.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files ?? []);

    if (photos.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos allowed`);
      return;
    }

    const invalid = files.find((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid) {
      setError('Only JPG, PNG, and WebP files are supported');
      return;
    }

    onChange([...photos, ...files]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Add Photos</h3>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{MAX_FILES}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previews.map((photo, index) => (
            <div key={photo.id} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt=""
                className="h-full w-full rounded-lg object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 w-full',
            'text-sm text-muted-foreground hover:border-pastel-pink hover:text-pastel-pink transition-colors'
          )}
        >
          <ImagePlus className="h-5 w-5" />
          Add Photos
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
