'use client';

import { useState } from 'react';
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  Tooltip,
  IconRenderer,
  Kbd,
} from '@nexus/ui';
import { GallerySection } from './gallery-section';

export function GalleryOverlays() {
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState(false);
  return (
    <GallerySection id="overlays" title="Dialogs, sheets, menus and toasts" description="Overlays trap focus, close on Escape and return focus to the trigger.">
      <div className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Short description of what this dialog does.</DialogDescription>
            </DialogHeader>
            <DialogBody><p className="text-sm text-text-muted">Body content scrolls independently of the header and footer.</p></DialogBody>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
              <DialogClose asChild><Button>Confirm</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="danger-ghost" onClick={() => setConfirm(true)}>Confirm dialog…</Button>
        <Button variant="danger-ghost" onClick={() => setTyped(true)}>Typed confirmation…</Button>
        <Sheet>
          <SheetTrigger asChild><Button variant="secondary">Open sheet</Button></SheetTrigger>
          <SheetContent side="right">
            <SheetHeader><SheetTitle>Sheet</SheetTitle><SheetDescription>Side panels suit filters and quick edits.</SheetDescription></SheetHeader>
          </SheetContent>
        </Sheet>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="secondary">Menu <IconRenderer name="ChevronDown" className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem destructive>Delete…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip content={<>Search <Kbd>⌘K</Kbd></>} side="top"><Button variant="ghost" size="icon" aria-label="Search"><IconRenderer name="Search" className="size-4" /></Button></Tooltip>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => toast.success('Saved', { description: 'Your changes were saved.' })}>Success toast</Button>
        <Button variant="secondary" onClick={() => toast.error('Could not save', { description: 'Check your connection.' })}>Error toast</Button>
        <Button variant="secondary" onClick={() => toast.info('FYI', { description: 'Toasts are announced politely.' })}>Info toast</Button>
      </div>
      <Tabs defaultValue="one">
        <TabsList aria-label="Tabs demo">
          <TabsTrigger value="one">Overview</TabsTrigger>
          <TabsTrigger value="two">Details</TabsTrigger>
          <TabsTrigger value="three">History</TabsTrigger>
        </TabsList>
        <TabsContent value="one"><p className="text-sm text-text-muted">Arrow keys move between tabs.</p></TabsContent>
        <TabsContent value="two"><p className="text-sm text-text-muted">Each panel is labelled by its tab.</p></TabsContent>
        <TabsContent value="three"><p className="text-sm text-text-muted">Content mounts only when active.</p></TabsContent>
      </Tabs>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Delete item?" description="This can’t be undone." onConfirm={() => { toast.success('Deleted (demo)'); }} />
      <ConfirmDialog open={typed} onOpenChange={setTyped} title="Delete everything?" description="Type the phrase to continue." requireText="DELETE" confirmLabel="Delete all" onConfirm={() => { toast.success('Deleted (demo)'); }} />
    </GallerySection>
  );
}
