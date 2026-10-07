'use client';

import Link from 'next/link';
import { Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, IconRenderer, Input, Label, Switch } from '@nexus/ui';
import { workflowStatusMeta } from './workflow-utils';
import type { WorkflowStatus } from './types';

interface Props {
  name: string;
  onNameChange: (name: string) => void;
  status: WorkflowStatus;
  version: number;
  readOnly: boolean;
  testing: boolean;
  statusBusy: boolean;
  onTest: () => void;
  onToggleActive: (next: boolean) => void;
  onHistory: () => void;
  onExport: () => void;
  onImport: () => void;
}

/** Name (inline edit), status, test run, activate switch and the overflow menu. */
export function BuilderHeader({ name, onNameChange, status, version, readOnly, testing, statusBusy, onTest, onToggleActive, onHistory, onExport, onImport }: Props) {
  const nameError = name.trim().length < 2 ? 'Name must be at least 2 characters.' : undefined;
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back to workflows"><Link href="/workflows"><IconRenderer name="ArrowLeft" className="size-4" /></Link></Button>
        <div className="min-w-0 flex-1">
          <h1 className="sr-only">Workflow builder: {name || 'Untitled workflow'}</h1>
          <Label htmlFor="workflow-name" className="sr-only">Workflow name</Label>
          <Input
            id="workflow-name"
            value={name}
            maxLength={80}
            readOnly={readOnly}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'workflow-name-error' : undefined}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-10 min-w-0 border-transparent bg-transparent text-lg font-semibold hover:border-border-strong md:w-80"
          />
          {nameError && <p id="workflow-name-error" role="alert" className="text-xs font-medium text-danger">{nameError}</p>}
        </div>
        <Badge variant={workflowStatusMeta[status].variant} dot>{workflowStatusMeta[status].label}</Badge>
        <span className="hidden text-xs text-text-muted sm:inline">v{version}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" loading={testing} onClick={onTest}><IconRenderer name="Play" className="size-4" /> Test run</Button>
        {!readOnly && (
          <span className="flex items-center gap-2 rounded-button border border-border bg-surface px-3 py-1.5 [@media(pointer:coarse)]:min-h-11">
            <Switch id="workflow-active" checked={status === 'active'} disabled={statusBusy} onCheckedChange={onToggleActive} />
            <Label htmlFor="workflow-active" className="text-sm">{status === 'active' ? 'Active' : 'Activate'}</Label>
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" aria-label="More workflow actions"><IconRenderer name="MoreHorizontal" className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onHistory}><IconRenderer name="Clock" className="size-4" /> Version history</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onExport}><IconRenderer name="Download" className="size-4" /> Export JSON</DropdownMenuItem>
            {!readOnly && <DropdownMenuItem onSelect={onImport}><IconRenderer name="Upload" className="size-4" /> Import JSON…</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
