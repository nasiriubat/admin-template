'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = forwardRef<ElementRef<typeof DialogPrimitive.Overlay>, ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  function Overlay({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]',
          'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
          className,
        )}
        {...props}
      />
    );
  },
);

function CloseButton() {
  return (
    <DialogPrimitive.Close
      aria-label="Close"
      className="absolute right-3 top-3 grid size-9 place-items-center rounded-md text-text-muted hover:bg-canvas hover:text-text [@media(pointer:coarse)]:size-11"
    >
      <IconRenderer name="X" className="size-4" />
    </DialogPrimitive.Close>
  );
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: 'sm' | 'md' | 'lg' }
>(function DialogContent({ className, children, size = 'md', ...props }, ref) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const;
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col',
          'rounded-card border border-border bg-surface-elevated text-text shadow-popover',
          'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
          widths[size],
          className,
        )}
        {...props}
      >
        {children}
        <CloseButton />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-5 pb-3 pr-14', className)} {...props} />;
}

export function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto px-5 py-2', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end', className)} {...props} />
  );
}

export const DialogTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  function DialogTitle({ className, ...props }, ref) {
    return <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
  },
);

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn('text-sm text-text-muted', className)} {...props} />;
});

/* ---------------------------------------------------------------- Sheet --- */

const sheetVariants = cva(
  'fixed z-50 flex flex-col bg-surface-elevated text-text shadow-popover border-border',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 w-full max-w-md border-l data-[state=open]:animate-sheet-right-in data-[state=closed]:animate-sheet-right-out',
        left: 'inset-y-0 left-0 w-4/5 max-w-sm border-r data-[state=open]:animate-sheet-left-in data-[state=closed]:animate-sheet-left-out',
        bottom:
          'inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t pb-safe data-[state=open]:animate-sheet-bottom-in data-[state=closed]:animate-sheet-bottom-out',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetHeader = DialogHeader;
export const SheetBody = DialogBody;
export const SheetFooter = DialogFooter;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;

/** Drawer/sheet. Use `side="bottom"` for mobile filter panels and action menus. */
export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & VariantProps<typeof sheetVariants>
>(function SheetContent({ side, className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {side === 'bottom' && <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong" aria-hidden="true" />}
        {children}
        <CloseButton />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

/* -------------------------------------------------------- ConfirmDialog --- */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` for destructive actions (default). */
  tone?: 'danger' | 'primary';
  /** Require typing this exact text before confirming (for very destructive actions). */
  requireText?: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * The explicit confirmation pattern for destructive actions. Confirm is never the autofocused
 * control: focus lands on Cancel so a stray Enter cannot delete anything.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  requireText,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canConfirm = !requireText || typed === requireText;

  // Reset on every close path (confirm, cancel, Escape, outside click) so a stale typed phrase
  // can never pre-satisfy the confirmation the next time the dialog opens.
  useEffect(() => {
    if (!open) {
      setTyped('');
      setError(null);
    }
  }, [open]);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) {
          setTyped('');
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent size="sm" role="alertdialog" onOpenAutoFocus={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-cancel]')?.focus();
      }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {(requireText || error) && (
          <DialogBody className="space-y-3 pb-3">
            {requireText && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm-text">
                  Type <span className="font-mono font-semibold">{requireText}</span> to confirm
                </Label>
                <Input id="confirm-text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
          </DialogBody>
        )}
        <DialogFooter>
          <Button data-cancel variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} disabled={!canConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
