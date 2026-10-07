'use client';

import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, formatBytes, formatDate, IconRenderer, toast } from '@nexus/ui';
import { downloadFile } from './download';
import { kindIcon, kindLabel, type FileItem } from './types';

export interface FileActionHandlers {
  canManage: boolean;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export async function copyFileLink(file: FileItem) {
  try {
    await navigator.clipboard.writeText(file.url);
    toast.success('Link copied', { description: file.name });
  } catch {
    toast.error('Could not copy the link', { description: 'Copy it manually: ' + file.url });
  }
}

function FileActions({ file, canManage, onRename, onDelete }: FileActionHandlers & { file: FileItem }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="icon" aria-label={`Download ${file.name}`} onClick={() => void downloadFile(file)}>
        <IconRenderer name="Download" className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Copy link for ${file.name}`} onClick={() => void copyFileLink(file)}>
        <IconRenderer name="Link2" className="size-4" />
      </Button>
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${file.name}`}>
              <IconRenderer name="MoreHorizontal" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onRename(file)}>
              <IconRenderer name="Pencil" className="size-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => onDelete(file)}>
              <IconRenderer name="Trash2" className="size-4" /> Delete…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function KindTile({ kind, className }: { kind: FileItem['kind']; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ${className ?? 'size-10'}`} title={kindLabel(kind)}>
      <IconRenderer name={kindIcon(kind)} className="size-5" />
      <span className="sr-only">{kindLabel(kind)}</span>
    </span>
  );
}

/** One row on desktop; on mobile the secondary fields stack under the name as a compact record. */
export function FileList({ files, ...handlers }: { files: FileItem[] } & FileActionHandlers) {
  return (
    <Card className="overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_6rem_10rem_8rem_6.5rem] gap-4 border-b border-border bg-canvas px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-text-muted md:grid" aria-hidden="true">
        <span>Name</span>
        <span>Size</span>
        <span>Uploaded by</span>
        <span>Date</span>
        <span />
      </div>
      <ul aria-label="Files" className="divide-y divide-border">
        {files.map((file) => (
          <li key={file.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_6rem_10rem_8rem_6.5rem] md:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <KindTile kind={file.kind} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{file.name}</p>
                <p className="truncate text-xs text-text-muted md:hidden">
                  {formatBytes(file.size)} · {file.uploadedBy} · {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
            <span className="hidden text-sm text-text-muted md:block">{formatBytes(file.size)}</span>
            <span className="hidden truncate text-sm text-text-muted md:block">{file.uploadedBy}</span>
            <span className="hidden text-sm text-text-muted md:block">{formatDate(file.createdAt)}</span>
            <div className="flex justify-end">
              <FileActions file={file} {...handlers} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function FileGrid({ files, ...handlers }: { files: FileItem[] } & FileActionHandlers) {
  return (
    <ul aria-label="Files" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <li key={file.id}>
          <Card className="flex h-full flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <KindTile kind={file.kind} className="size-12" />
              <FileActions file={file} {...handlers} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text" title={file.name}>{file.name}</p>
              <p className="text-xs text-text-muted">{formatBytes(file.size)} · {formatDate(file.createdAt)}</p>
              <p className="truncate text-xs text-text-muted">by {file.uploadedBy}</p>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
