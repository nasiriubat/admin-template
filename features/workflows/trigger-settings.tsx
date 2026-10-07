'use client';

import { useState } from 'react';
import { Alert, Button, ConfirmDialog, FormField, IconRenderer, Input, Select, toast } from '@nexus/ui';
import { useRotateSecret } from './hooks';
import { ScheduleEditor } from './schedule-editor';
import { EVENT_CATALOGUE, TRIGGER_TYPES, type ScheduleConfig, type TriggerType, type WebhookInfo } from './types';

interface Props {
  workflowId: string;
  webhook: WebhookInfo | null;
  triggerType: TriggerType;
  eventName: string;
  schedule: ScheduleConfig;
  scheduleRevision: number;
  readOnly: boolean;
  hasTriggerNode: boolean;
  onTriggerChange: (patch: { triggerType?: TriggerType; eventName?: string }) => void;
  onScheduleChange: (value: ScheduleConfig) => void;
}

function copy(text: string, what: string) {
  void navigator.clipboard?.writeText(text).then(() => toast.success(`${what} copied`), () => toast.error('Copy failed. Select the text and copy it manually.'));
}

function WebhookPanel({ workflowId, webhook, readOnly }: { workflowId: string; webhook: WebhookInfo | null; readOnly: boolean }) {
  const rotate = useRotateSecret();
  const [confirm, setConfirm] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const last4 = secret ? secret.slice(-4) : webhook?.secretLast4;
  return (
    <div className="space-y-4">
      <FormField label="Endpoint URL" hint="POST JSON to this URL. Requests must be signed with the secret.">
        <div className="flex gap-2">
          <Input readOnly value={webhook?.url ?? ''} className="font-mono text-xs" />
          <Button variant="secondary" onClick={() => copy(webhook?.url ?? '', 'Endpoint URL')} aria-label="Copy endpoint URL"><IconRenderer name="Copy" className="size-4" /></Button>
        </div>
      </FormField>
      <FormField label="Signing secret" hint="Secrets are write-only: only the last four characters are ever shown again.">
        <div className="flex gap-2">
          <Input readOnly value={`whsec_••••••••${last4 ?? ''}`} className="font-mono text-xs" aria-label="Signing secret (masked)" />
          <Button variant="secondary" disabled={readOnly} onClick={() => setConfirm(true)}><IconRenderer name="RefreshCw" className="size-4" /> Rotate</Button>
        </div>
      </FormField>
      {secret && (
        <Alert variant="warning" title="Copy your new secret now">
          <p className="break-all font-mono text-xs">{secret}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => copy(secret, 'Secret')}>Copy secret</Button>
            <Button size="sm" variant="ghost" onClick={() => setSecret(null)}>I have stored it</Button>
          </div>
        </Alert>
      )}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Rotate the signing secret?"
        description="The old secret stops working immediately. Update every system that calls this webhook with the new secret."
        confirmLabel="Rotate secret"
        onConfirm={async () => {
          const result = await rotate.mutateAsync(workflowId);
          setSecret(result.secret);
          toast.success('Secret rotated');
        }}
      />
    </div>
  );
}

/** Trigger type picker plus the matching details: schedule editor, webhook endpoint, or event catalogue. */
export function TriggerSettings({ workflowId, webhook, triggerType, eventName, schedule, scheduleRevision, readOnly, hasTriggerNode, onTriggerChange, onScheduleChange }: Props) {
  if (!hasTriggerNode) return <Alert variant="warning" title="No trigger yet">Add a Trigger node on the canvas, then return here to configure how it starts.</Alert>;
  return (
    <div className="space-y-5">
      <FormField label="Trigger type">
        <Select value={triggerType} disabled={readOnly} onChange={(e) => onTriggerChange({ triggerType: e.target.value as TriggerType })}>
          {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </FormField>
      {triggerType === 'manual' && <p className="text-sm text-text-muted">The workflow runs when someone chooses Run now, or from the API.</p>}
      {triggerType === 'schedule' && <ScheduleEditor key={scheduleRevision} value={schedule} onChange={onScheduleChange} readOnly={readOnly} />}
      {triggerType === 'webhook' && <WebhookPanel workflowId={workflowId} webhook={webhook} readOnly={readOnly} />}
      {triggerType === 'event' && (
        <FormField label="Event" required hint="The workflow runs each time this event is emitted.">
          <Select value={eventName} disabled={readOnly} onChange={(e) => onTriggerChange({ eventName: e.target.value })}>
            <option value="">Choose an event</option>
            {EVENT_CATALOGUE.map((ev) => <option key={ev.value} value={ev.value}>{ev.label} ({ev.value})</option>)}
          </Select>
        </FormField>
      )}
    </div>
  );
}
