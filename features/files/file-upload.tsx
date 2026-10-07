'use client';

import { useCallback, useId, useRef, useState, type DragEvent } from 'react';
import { Button, cn, formatBytes, IconRenderer, Progress, toast } from '@nexus/ui';
import { useUploadFile } from './hooks';
import { ACCEPT_ATTRIBUTE, MAX_FILE_SIZE, validateFile } from './schemas';

interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

let counter = 0;

/**
 * Drop zone plus per-file upload queue. The zone is a real <label> for a visually hidden file
 * input, so click, Enter and Space all open the picker. Progress is simulated while the request
 * is in flight and snaps to 100% when the API resolves.
 */
export function FileUploader({ disabled }: { disabled?: boolean }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const upload = useUploadFile();

  const patch = useCallback((id: string, next: Partial<UploadItem>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i))), []);

  const send = useCallback(
    async (file: File, id: string) => {
      const timer = setInterval(() => {
        setItems((prev) => prev.map((i) => (i.id === id && i.status === 'uploading' ? { ...i, progress: Math.min(90, i.progress + 12 + Math.round(Math.random() * 10)) } : i)));
      }, 140);
      try {
        await upload.mutateAsync({ name: file.name, size: file.size, mimeType: file.type || 'application/octet-stream' });
        patch(id, { progress: 100, status: 'done' });
        toast.success('File uploaded', { description: file.name });
        setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2500);
      } catch (e) {
        const fields = (e as { fields?: Record<string, string> }).fields;
        patch(id, { status: 'error', error: fields?.name ?? (e instanceof Error ? e.message : 'Upload failed.') });
      } finally {
        clearInterval(timer);
      }
    },
    [patch, upload],
  );

  const accept = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      const queued: UploadItem[] = [];
      const toSend: Array<[File, string]> = [];
      for (const file of files) {
        const id = `up-${(counter += 1)}`;
        const error = validateFile(file);
        queued.push({ id, name: file.name, size: file.size, progress: 0, status: error ? 'error' : 'uploading', error: error ?? undefined });
        if (!error) toSend.push([file, id]);
      }
      setItems((prev) => [...queued, ...prev]);
      for (const [file, id] of toSend) void send(file, id);
    },
    [send],
  );

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length) accept(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors',
          'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
          dragging ? 'border-primary bg-primary/10' : 'border-border-strong bg-surface hover:bg-canvas',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <IconRenderer name="Upload" className="size-5" />
        </span>
        <span className="text-sm font-medium text-text">
          <span className="text-primary underline underline-offset-2">Choose files</span> or drag them here
        </span>
        <span className="text-xs text-text-muted">Images, documents and archives up to {formatBytes(MAX_FILE_SIZE)} each.</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          disabled={disabled}
          className="sr-only"
          data-testid="file-input"
          onChange={(e) => {
            if (e.target.files?.length) accept(e.target.files);
            e.target.value = '';
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface" aria-label="Uploads">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
              <IconRenderer name={item.status === 'error' ? 'AlertCircle' : item.status === 'done' ? 'CheckCircle2' : 'Upload'} className={cn('size-4 shrink-0', item.status === 'error' ? 'text-danger' : item.status === 'done' ? 'text-success' : 'text-text-muted')} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{item.name}</p>
                {item.status === 'error' ? (
                  <p role="alert" className="text-xs font-medium text-danger">{item.error}</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress className="flex-1" value={item.progress} label={`Uploading ${item.name}`} />
                    <span className="w-9 text-right text-xs tabular-nums text-text-muted">{item.progress}%</span>
                  </div>
                )}
              </div>
              <span className="hidden text-xs text-text-muted sm:block">{formatBytes(item.size)}</span>
              {item.status !== 'uploading' && (
                <Button variant="ghost" size="icon" aria-label={`Dismiss ${item.name}`} onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}>
                  <IconRenderer name="X" className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
