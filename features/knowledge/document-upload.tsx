'use client';

import { useCallback, useId, useState, type DragEvent } from 'react';
import { Button, cn, formatBytes, IconRenderer, toast } from '@nexus/ui';
import { useUploadDocument } from './hooks';
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_SIZE, validateDocument } from './schemas';

interface UploadItem {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

let counter = 0;

/** Drop zone (a label for a visually hidden file input) plus a per-file result list. */
export function DocumentUploader({ disabled }: { disabled?: boolean }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const upload = useUploadDocument();

  const patch = useCallback((id: string, next: Partial<UploadItem>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i))), []);

  const send = useCallback(
    async (file: File, id: string) => {
      try {
        await upload.mutateAsync({ name: file.name, size: file.size });
        patch(id, { status: 'done' });
        toast.success('Document uploaded', { description: `${file.name} is queued for indexing.` });
        setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2500);
      } catch (e) {
        const fields = (e as { fields?: Record<string, string> }).fields;
        patch(id, { status: 'error', error: fields?.name ?? (e instanceof Error ? e.message : 'Upload failed.') });
      }
    },
    [patch, upload],
  );

  const accept = useCallback(
    (list: FileList | File[]) => {
      const queued: UploadItem[] = [];
      const toSend: Array<[File, string]> = [];
      for (const file of Array.from(list)) {
        const id = `kup-${(counter += 1)}`;
        const error = validateDocument(file);
        queued.push({ id, name: file.name, size: file.size, status: error ? 'error' : 'uploading', error: error ?? undefined });
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
          'flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors',
          'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
          dragging ? 'border-primary bg-primary/10' : 'border-border-strong bg-surface hover:bg-canvas',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <IconRenderer name="Upload" className="size-5" />
        </span>
        <span className="text-sm font-medium text-text">
          <span className="text-primary underline underline-offset-2">Choose documents</span> or drag them here
        </span>
        <span className="text-xs text-text-muted">PDF, Markdown, text and Word files up to {formatBytes(MAX_DOCUMENT_SIZE)} each.</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={DOCUMENT_ACCEPT}
          disabled={disabled}
          className="sr-only"
          data-testid="document-input"
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
                  <p role="status" className="text-xs text-text-muted">{item.status === 'done' ? 'Uploaded' : 'Uploading…'}</p>
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
