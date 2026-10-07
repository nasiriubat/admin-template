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

/** Shows a signing secret once. The parent holds it in state only and clears it on close. */
export function WebhookSecretDialog({ secret, title, onClose }: { secret: string | null; title: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success('Signing secret copied');
    } catch {
      toast.error('Could not copy automatically', { description: 'Select the secret and copy it manually.' });
    }
  }

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={Boolean(secret)} onOpenChange={(open) => !open && close()}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Use this secret to verify the signature on each delivery.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 py-3">
          <Alert variant="warning" title="You won’t see this secret again">
            Only a masked reference is stored. If you lose it, rotate the secret to get a new one.
          </Alert>
          <div className="flex items-center gap-2">
            <code data-testid="webhook-secret" aria-label="Signing secret" className="min-w-0 flex-1 select-all break-all rounded-input border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-text">
              {secret}
            </code>
            <Button variant="secondary" onClick={() => void copy()} aria-label="Copy signing secret">
              <IconRenderer name={copied ? 'Check' : 'Copy'} className="size-4" /> {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={close}>I’ve saved the secret</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
