'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  IconRenderer,
  toast,
} from '@nexus/ui';
import type { CreatedApiKey } from './types';

/**
 * Shows the full secret once. The parent keeps it in component state only and drops it as soon as
 * this dialog closes; it is never written to the query cache, storage or the URL.
 */
export function ApiKeySecretDialog({ created, onClose }: { created: CreatedApiKey | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.secret);
      setCopied(true);
      toast.success('Key copied to clipboard');
    } catch {
      toast.error('Could not copy automatically', { description: 'Select the key and copy it manually.' });
    }
  }

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={Boolean(created)} onOpenChange={(open) => !open && close()}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Your new API key</DialogTitle>
          <DialogDescription>{created ? `Copy the secret for “${created.key.name}” and store it somewhere safe.` : ''}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 py-3">
          <Alert variant="warning" title="You won’t see this key again">
            For your security we only keep a masked reference. If you lose it, revoke this key and create a new one.
          </Alert>
          <div className="flex items-center gap-2">
            <code
              data-testid="api-key-secret"
              aria-label="API key secret"
              className="min-w-0 flex-1 select-all break-all rounded-input border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text"
            >
              {created?.secret}
            </code>
            <Button variant="secondary" onClick={() => void copy()} aria-label="Copy API key">
              <IconRenderer name={copied ? 'Check' : 'Copy'} className="size-4" /> {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={close}>I’ve saved my key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
