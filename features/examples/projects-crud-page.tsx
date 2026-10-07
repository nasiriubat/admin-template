'use client';

/**
 * COPY-ME TEMPLATE, part 2 of 2: a list page + create/edit dialog + delete confirmation.
 * Data layer lives in ./projects.ts. Pattern, top to bottom:
 *   - useTableQuery owns search/sort/page state; the debounced search goes to the server.
 *   - DataTable renders loading / empty / error states and turns rows into cards on mobile.
 *   - One dialog handles create AND edit (pass `project` to edit).
 *   - Destructive actions always go through ConfirmDialog.
 *   - Gate writes with `useCan('<module>.manage')` once your module declares that permission.
 */
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  applyServerErrors,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FilterBar,
  FormField,
  IconRenderer,
  Input,
  PageContainer,
  PageHeader,
  Select,
  TagInput,
  toast,
  useDebouncedValue,
  useTableQuery,
  useZodForm,
} from '@nexus/ui';
import { ExampleBanner } from './example-banner';
import {
  PROJECT_STATUSES,
  projectFormSchema,
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
  type Project,
  type ProjectFormInput,
  type ProjectStatus,
} from './projects';

const statusVariant: Record<ProjectStatus, 'neutral' | 'success' | 'warning' | 'info'> = { planned: 'neutral', active: 'success', paused: 'warning', done: 'info' };
const col = createColumnHelper<Project>();
const EMPTY: ProjectFormInput = { name: '', owner: '', status: 'planned', budget: 0, tags: [] };

export function ProjectsCrudPage() {
  const { query, setQuery } = useTableQuery({ sort: 'createdAt', direction: 'desc' });
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query.search);
  const list = useProjects({ page: query.page, pageSize: query.pageSize, sort: query.sort, direction: query.direction, search, filters: { status } });

  const [editing, setEditing] = useState<Project | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const remove = useDeleteProject();

  const columns = useMemo(
    () => [
      // `meta.mobile: 'primary'` makes this the card title when the table collapses on phones.
      col.accessor('name', { header: 'Project', meta: { label: 'Project', mobile: 'primary', alwaysVisible: true }, cell: (c) => <span className="font-medium text-text">{c.getValue()}</span> }),
      col.accessor('owner', { header: 'Owner' }),
      col.accessor('status', { header: 'Status', cell: (c) => <Badge variant={statusVariant[c.getValue()]} dot className="capitalize">{c.getValue()}</Badge> }),
      col.accessor('budget', { header: 'Budget', cell: (c) => `$${c.getValue().toLocaleString()}`, meta: { className: 'tabular-nums' } }),
      col.accessor('tags', { header: 'Tags', enableSorting: false, cell: (c) => c.getValue().join(', '), meta: { mobile: 'hidden', exportValue: (p: Project) => p.tags.join('|') } }),
    ],
    [],
  );

  const openForm = (project: Project | null) => {
    setEditing(project);
    setFormOpen(true);
  };
  const clearFilters = () => {
    setStatus('');
    setQuery({ page: 1 });
  };

  return (
    <PageContainer>
      <ExampleBanner />
      <PageHeader title="Projects (CRUD scaffold)" description="Copy projects.ts and this file to build a new resource: table, create/edit dialog and delete confirmation." />
      <DataTable<Project>
        caption="Projects"
        columns={columns}
        data={list.data?.items ?? []}
        total={list.data?.meta.total}
        getRowId={(p) => p.id}
        getRowLabel={(p) => p.name}
        mode="server"
        query={query}
        onQueryChange={setQuery}
        isLoading={list.isPending}
        isFetching={list.isFetching && !list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        searchPlaceholder="Search by name or owner"
        exportFileName="projects"
        hasActiveFilters={Boolean(status)}
        onClearFilters={clearFilters}
        emptyTitle="No projects yet"
        emptyDescription="Create the first project to see it here."
        emptyAction={<Button onClick={() => openForm(null)}>New project</Button>}
        toolbarActions={
          <Button onClick={() => openForm(null)}>
            <IconRenderer name="Plus" className="size-4" /> New project
          </Button>
        }
        filters={
          <FilterBar activeCount={status ? 1 : 0} onClear={clearFilters}>
            <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setQuery({ page: 1 }); }} className="md:w-40">
              <option value="">All statuses</option>
              {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FilterBar>
        }
        rowActions={(project) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${project.name}`}>
                <IconRenderer name="MoreHorizontal" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => openForm(project)}>
                <IconRenderer name="Pencil" className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setDeleting(project)}>
                <IconRenderer name="Trash2" className="size-4" /> Delete…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} project={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'project'}?`}
        description="This removes the project for everyone. This can’t be undone."
        confirmLabel="Delete project"
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id); // a thrown error keeps the dialog open and is shown inside it
          toast.success('Project deleted', { description: deleting.name });
        }}
      />
    </PageContainer>
  );
}

/** Create or edit. Server-side field errors (e.g. duplicate name) are mapped back onto the inputs. */
function ProjectFormDialog({ open, onOpenChange, project }: { open: boolean; onOpenChange: (open: boolean) => void; project: Project | null }) {
  const create = useCreateProject();
  const update = useUpdateProject();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(projectFormSchema, { defaultValues: EMPTY });
  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors, isSubmitting } = formState;
  const tags = watch('tags') ?? [];

  // Reset every time the dialog opens so edits never leak between records.
  useEffect(() => {
    if (open) {
      setFormError(null);
      reset(project ? { name: project.name, owner: project.owner, status: project.status, budget: project.budget, tags: project.tags } : EMPTY);
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (project) await update.mutateAsync({ id: project.id, input: values });
      else await create.mutateAsync(values);
      toast.success(project ? 'Project updated' : 'Project created', { description: values.name });
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(form as never, error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{project ? 'Edit project' : 'New project'}</DialogTitle>
            <DialogDescription>Fields marked with an asterisk are required.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 py-3">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <FormField label="Name" required error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label="Owner" required error={errors.owner?.message}>
              <Input autoComplete="off" {...register('owner')} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Status" required error={errors.status?.message}>
                <Select {...register('status')}>
                  {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Budget (USD)" error={errors.budget?.message}>
                <Input type="number" inputMode="numeric" min={0} {...register('budget')} />
              </FormField>
            </div>
            <FormField label="Tags" optional hint="Press Enter or comma to add." error={errors.tags?.message as string | undefined}>
              {(a) => <TagInput {...a} value={tags} onChange={(next) => setValue('tags', next, { shouldDirty: true, shouldValidate: true })} maxTags={5} />}
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{project ? 'Save changes' : 'Create project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
