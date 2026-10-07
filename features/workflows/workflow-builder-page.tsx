'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { useCan } from '@nexus/auth';
import {
  Alert, Button, ConfirmDialog, PageContainer, QueryBoundary, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, Skeleton, StickyActionBar,
  Tabs, TabsContent, TabsList, TabsTrigger, toast, useMediaQuery, useUnsavedChangesWarning,
} from '@nexus/ui';
import { BuilderCanvas } from './builder-canvas';
import { BuilderHeader } from './builder-header';
import { BuilderOutline } from './builder-outline';
import { flowToGraph, toFlowEdge, toFlowNode, useWorkflowEditor, type RunOverlay } from './editor-state';
import { validateGraph, type GraphIssue } from './graph';
import { useBuilderStatus, useSaveWorkflow, useTestRun, useWorkflow, useWorkflowModels } from './hooks';
import { downloadWorkflow, ImportDialog } from './import-export';
import { NodeInspector } from './node-inspector';
import { RunPanel } from './run-panel';
import { saveWorkflowSchema, scheduleSchema } from './schemas';
import { FALLBACK_MODELS } from './service';
import { TriggerSettings } from './trigger-settings';
import { ValidationPanel } from './validation-panel';
import { VersionHistorySheet } from './version-history-sheet';
import { errorText } from './workflow-utils';
import type { WorkflowDocument } from './workflow-io';
import type { ScheduleConfig, TriggerType, Workflow, WorkflowRun } from './types';

function BuilderSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading workflow">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-[26rem] w-full" />
    </div>
  );
}

const normalize = (g: Workflow['graph']) => JSON.stringify(flowToGraph(g.nodes.map(toFlowNode), g.edges.map(toFlowEdge)));
const isTyping = (t: EventTarget | null) => ['INPUT', 'TEXTAREA', 'SELECT'].includes((t as HTMLElement | null)?.tagName ?? '');

function Builder({ workflow }: { workflow: Workflow }) {
  const canManage = useCan('workflows.manage');
  const readOnly = !canManage;
  const editor = useWorkflowEditor(workflow.graph, readOnly);
  const modelsQuery = useWorkflowModels();
  const models = modelsQuery.data ?? FALLBACK_MODELS;
  const save = useSaveWorkflow();
  const setStatus = useBuilderStatus();
  const test = useTestRun();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [schedule, setSchedule] = useState<ScheduleConfig>(workflow.schedule);
  const [scheduleRev, setScheduleRev] = useState(0);
  const [tab, setTab] = useState('canvas');
  const [bottomTab, setBottomTab] = useState('validation');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ nodes: string[]; edges: string[] } | null>(null);
  const [run, setRun] = useState<WorkflowRun | null>(null);

  const triggerNode = editor.graph.nodes.find((n) => n.type === 'trigger');
  const triggerType = (triggerNode?.config.triggerType as TriggerType | undefined) ?? 'manual';
  const eventName = String(triggerNode?.config.eventName ?? '');
  const scheduleResult = useMemo(() => scheduleSchema.safeParse(schedule), [schedule]);

  const issues = useMemo<GraphIssue[]>(() => {
    const list = validateGraph(editor.graph);
    if (triggerType === 'schedule' && !scheduleResult.success) list.push({ id: 'schedule', severity: 'error', message: `Schedule: ${scheduleResult.error.issues[0]?.message ?? 'is not valid.'}` });
    return list;
  }, [editor.graph, triggerType, scheduleResult]);
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const issueByNode = useMemo(() => {
    const map: Record<string, 'error' | 'warning'> = {};
    for (const i of issues) if (i.nodeId && map[i.nodeId] !== 'error') map[i.nodeId] = i.severity;
    return map;
  }, [issues]);
  const runByNode = useMemo(() => {
    const map: Record<string, RunOverlay> = {};
    for (const s of run?.steps ?? []) map[s.nodeId] = { status: s.status, durationMs: s.durationMs, tokens: s.tokens };
    return map;
  }, [run]);

  const nameValid = name.trim().length >= 2;
  const dirty = normalize(editor.graph) !== normalize(workflow.graph) || name !== workflow.name || description !== workflow.description || JSON.stringify(schedule) !== JSON.stringify(workflow.schedule);
  useUnsavedChangesWarning(dirty);

  const doSave = useCallback(async () => {
    if (readOnly || save.isPending) return;
    if (!nameValid) return toast.error('Give the workflow a name of at least 2 characters.');
    const input = { name, description, graph: editor.graph, schedule: scheduleResult.success ? scheduleResult.data : workflow.schedule };
    const parsed = saveWorkflowSchema.safeParse(input);
    if (!parsed.success) return toast.error('Could not save', { description: parsed.error.issues[0]?.message });
    try {
      const updated = await save.mutateAsync({ id: workflow.id, input: parsed.data });
      if (normalize(updated.graph) !== normalize(editor.graph)) editor.replace(updated.graph, false);
      toast.success('Workflow saved', { description: `Version ${updated.version}` });
    } catch (e) {
      toast.error('Could not save the workflow', { description: errorText(e) });
    }
  }, [readOnly, save, nameValid, name, description, editor, scheduleResult, workflow]);

  function showProblems(message: string) {
    setBottomTab('validation');
    toast.error(message, { description: 'See the Validation panel below the canvas.' });
  }

  async function runTest() {
    if (errorCount > 0) return showProblems(`Fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} before a test run`);
    try {
      const result = await test.mutateAsync({ id: workflow.id, graph: editor.graph });
      setRun(result);
      setBottomTab('run');
      toast.success('Test run finished', { description: 'Simulated only: no model, URL or recipient was contacted.' });
    } catch (e) {
      toast.error('Test run failed', { description: errorText(e) });
    }
  }

  async function toggleActive(next: boolean) {
    if (next && dirty) return void toast.error('Save your changes before activating.');
    if (next && errorCount > 0) return showProblems(`Fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} before activating`);
    try {
      await setStatus.mutateAsync({ id: workflow.id, status: next ? 'active' : 'paused' });
      toast.success(next ? 'Workflow activated' : 'Workflow paused');
    } catch (e) {
      toast.error('Could not change the status', { description: errorText(e) });
    }
  }

  const resetTo = useCallback((w: Workflow) => {
    editor.replace(w.graph, false);
    setName(w.name);
    setDescription(w.description);
    setSchedule(w.schedule);
    setScheduleRev((r) => r + 1);
    setRun(null);
  }, [editor]);

  const requestDeleteSelected = () => setPendingDelete({ nodes: editor.selectedNodes.map((n) => n.id), edges: editor.selectedEdges.map((e) => e.id) });
  const focusNode = (id: string) => {
    editor.select([id]);
    setTab('canvas');
    setFocusId(id);
  };
  const onTriggerChange = (patch: { triggerType?: TriggerType; eventName?: string }) => {
    if (triggerNode) editor.updateNode(triggerNode.id, { config: { ...triggerNode.config, ...patch } }, 'trigger');
  };
  const onImport = (doc: WorkflowDocument) => {
    editor.replace(doc.graph);
    if (doc.schedule) {
      setSchedule(doc.schedule);
      setScheduleRev((r) => r + 1);
    }
    toast.success('Workflow imported', { description: 'Review it, then press Save. Undo restores the previous graph.' });
  };

  function onKeyDown(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === 's') {
      e.preventDefault();
      void doSave();
    } else if (!isTyping(e.target) && key === 'z') {
      e.preventDefault();
      if (e.shiftKey) editor.redo();
      else editor.undo();
    } else if (!isTyping(e.target) && key === 'y') {
      e.preventDefault();
      editor.redo();
    }
  }

  const inspector = <NodeInspector editor={editor} models={models} readOnly={readOnly} onRequestDelete={requestDeleteSelected} />;
  const counts = pendingDelete ? `${pendingDelete.nodes.length ? `${pendingDelete.nodes.length} ${pendingDelete.nodes.length === 1 ? 'node' : 'nodes'}` : ''}${pendingDelete.nodes.length && pendingDelete.edges.length ? ' and ' : ''}${pendingDelete.edges.length ? `${pendingDelete.edges.length} ${pendingDelete.edges.length === 1 ? 'connection' : 'connections'}` : ''}` : '';

  return (
    <div className="space-y-4" onKeyDown={onKeyDown}>
      {readOnly && <Alert variant="info" title="View-only access">You can inspect this workflow and run a test, but editing needs the workflows.manage permission.</Alert>}
      <BuilderHeader
        name={name}
        onNameChange={setName}
        status={workflow.status}
        version={workflow.version}
        readOnly={readOnly}
        testing={test.isPending}
        statusBusy={setStatus.isPending}
        onTest={() => void runTest()}
        onToggleActive={(v) => void toggleActive(v)}
        onHistory={() => setHistoryOpen(true)}
        onExport={() => downloadWorkflow({ name, description, graph: editor.graph, schedule })}
        onImport={() => setImportOpen(true)}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Builder views">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="settings">Trigger &amp; schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="pt-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <BuilderCanvas editor={editor} readOnly={readOnly} issueByNode={issueByNode} runByNode={runByNode} focusId={focusId} onFocused={() => setFocusId(null)} onRequestDelete={requestDeleteSelected} sheetInspector={!isDesktop} onEditNode={() => setInspectorOpen(true)} />
            {isDesktop && <aside aria-label="Inspector" className="max-h-[70dvh] overflow-y-auto rounded-card border border-border bg-surface p-4 custom-scrollbar">{inspector}</aside>}
          </div>
        </TabsContent>

        <TabsContent value="outline" className="pt-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <BuilderOutline editor={editor} readOnly={readOnly} onRequestDeleteNode={(id) => setPendingDelete({ nodes: [id], edges: [] })} onEditNode={(id) => { editor.select([id]); if (!isDesktop) setInspectorOpen(true); }} />
            {isDesktop && <aside aria-label="Inspector" className="self-start rounded-card border border-border bg-surface p-4">{inspector}</aside>}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="max-w-2xl space-y-6 pt-3">
          <div className="space-y-1.5">
            <label htmlFor="workflow-description" className="text-sm font-medium text-text">Description</label>
            <textarea id="workflow-description" rows={2} maxLength={300} readOnly={readOnly} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-input border border-border-strong bg-surface px-3 py-2 text-sm text-text read-only:bg-canvas" />
          </div>
          <TriggerSettings workflowId={workflow.id} webhook={workflow.webhook} triggerType={triggerType} eventName={eventName} schedule={schedule} scheduleRevision={scheduleRev} readOnly={readOnly} hasTriggerNode={Boolean(triggerNode)} onTriggerChange={onTriggerChange} onScheduleChange={setSchedule} />
        </TabsContent>
      </Tabs>

      <Tabs value={bottomTab} onValueChange={setBottomTab}>
        <TabsList aria-label="Validation and test results">
          <TabsTrigger value="validation">Validation{issues.length ? ` (${issues.length})` : ''}</TabsTrigger>
          <TabsTrigger value="run">Test run</TabsTrigger>
        </TabsList>
        <TabsContent value="validation" className="pt-3"><ValidationPanel issues={issues} onFocusNode={focusNode} /></TabsContent>
        <TabsContent value="run" className="pt-3"><RunPanel run={run} running={test.isPending} onClear={() => setRun(null)} /></TabsContent>
      </Tabs>

      {!readOnly && (
        <StickyActionBar dirty={dirty}>
          <Button variant="secondary" disabled={!dirty || save.isPending} onClick={() => setDiscardOpen(true)}>Discard</Button>
          <Button loading={save.isPending} disabled={!dirty} onClick={() => void doSave()}>Save</Button>
        </StickyActionBar>
      )}

      <Sheet open={inspectorOpen && !isDesktop} onOpenChange={setInspectorOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Node settings</SheetTitle><SheetDescription>Changes apply as you type.</SheetDescription></SheetHeader>
          <SheetBody>{inspector}</SheetBody>
        </SheetContent>
      </Sheet>

      <VersionHistorySheet open={historyOpen} onOpenChange={setHistoryOpen} workflow={workflow} canManage={canManage} dirty={dirty} onRestored={resetTo} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={onImport} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={`Delete ${counts}?`}
        description="Connections attached to deleted nodes are removed too. Press Ctrl+Z (or Undo) to bring them back until you save."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) editor.remove(pendingDelete.nodes, pendingDelete.edges);
        }}
      />
      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard unsaved changes?"
        description="The canvas, name and schedule go back to the last saved version."
        confirmLabel="Discard changes"
        onConfirm={() => resetTo(workflow)}
      />
    </div>
  );
}

/** Drag-and-drop workflow builder (`/workflows/[id]`). */
export function WorkflowBuilderPage({ id }: { id: string }) {
  const query = useWorkflow(id);
  return (
    <PageContainer>
      <QueryBoundary query={query} loading={<BuilderSkeleton />}>
        {(workflow) => (
          <ReactFlowProvider>
            <Builder key={workflow.id} workflow={workflow} />
          </ReactFlowProvider>
        )}
      </QueryBoundary>
    </PageContainer>
  );
}
