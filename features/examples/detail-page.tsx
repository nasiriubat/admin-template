'use client';

import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  ActivityTimeline,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  DataTable,
  DescriptionList,
  formatDate,
  formatRelative,
  PageContainer,
  PageHeader,
  Progress,
  QueryBoundary,
  SetBreadcrumbs,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  useTableQuery,
  type ActivityTimelineItem,
} from '@nexus/ui';
import { api } from '../_shared/api';
import { ExampleBanner } from './example-banner';
import { useProject, type Project } from './projects';

interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  at: string;
  icon: string;
  tone: ActivityTimelineItem['tone'];
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  done: boolean;
}

// Related records are static here; a real page would query `/projects/:id/tasks` the same way as the list pages.
const TASKS: Task[] = [
  { id: 't1', title: 'Write migration runbook', assignee: 'Avery Morgan', due: '2026-11-03', done: true },
  { id: 't2', title: 'Dry-run on staging', assignee: 'Jordan Lee', due: '2026-11-10', done: false },
  { id: 't3', title: 'Customer comms draft', assignee: 'Sam Rivera', due: '2026-11-12', done: false },
  { id: 't4', title: 'Rollback rehearsal', assignee: 'Riley Nguyen', due: '2026-11-18', done: false },
];
const col = createColumnHelper<Task>();

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function TasksTable() {
  const { query, setQuery } = useTableQuery({ pageSize: 5 });
  const columns = useMemo(
    () => [
      col.accessor('title', { header: 'Task', meta: { label: 'Task', mobile: 'primary', alwaysVisible: true } }),
      col.accessor('assignee', { header: 'Assignee' }),
      col.accessor('due', { header: 'Due', cell: (c) => formatDate(c.getValue()) }),
      col.accessor('done', { header: 'Status', cell: (c) => <Badge variant={c.getValue() ? 'success' : 'neutral'} dot>{c.getValue() ? 'Done' : 'Open'}</Badge>, enableSorting: false }),
    ],
    [],
  );
  return (
    <DataTable<Task>
      caption="Tasks for this project"
      columns={columns}
      data={TASKS}
      getRowId={(t) => t.id}
      getRowLabel={(t) => t.title}
      mode="client"
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder="Search tasks"
      emptyTitle="No tasks"
      emptyDescription="Tasks linked to this project will appear here."
    />
  );
}

/**
 * Detail page pattern: summary header (what is it, what state, main actions), then Tabs that split
 * facts / history / related records so the first screen stays short. Loading, error and
 * unauthorized states come from QueryBoundary.
 */
export function DetailExamplePage({ id = 'p-001' }: { id?: string }) {
  const project = useProject(id);
  const activity = useQuery({ queryKey: ['examples', 'projects', 'activity', id], queryFn: ({ signal }) => api.get<ActivityEvent[]>(`/examples/projects/${id}/activity`, { signal }) });

  return (
    <PageContainer>
      <ExampleBanner />
      {project.data && <SetBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Examples', href: '/examples/components' }, { label: 'Detail page' }, { label: project.data.name }]} />}
      <QueryBoundary query={project} loading={<DetailSkeleton />}>
        {(p: Project) => (
          <>
            <PageHeader
              title={p.name}
              description={`Owned by ${p.owner}`}
              actions={
                <>
                  <Button variant="secondary" onClick={() => toast.info('Share link copied (demo)')}>Share</Button>
                  <Button onClick={() => toast.success('Edit would open here')}>Edit project</Button>
                </>
              }
            />
            <Card>
              <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={p.owner} size="lg" />
                  <div>
                    <p className="text-sm font-medium text-text">{p.owner}</p>
                    <p className="text-xs text-text-muted">Project owner</p>
                  </div>
                </div>
                <Badge variant={p.status === 'active' ? 'success' : 'neutral'} dot className="capitalize">{p.status}</Badge>
                <div className="min-w-48 flex-1">
                  <Progress label="Budget used" value={62} showValue tone="primary" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview">
              <TabsList aria-label="Project sections">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card>
                  <CardContent>
                    <DescriptionList
                      columns={3}
                      items={[
                        { label: 'Project ID', value: <code className="font-mono text-xs">{p.id}</code> },
                        { label: 'Owner', value: p.owner },
                        { label: 'Status', value: <span className="capitalize">{p.status}</span> },
                        { label: 'Budget', value: `$${p.budget.toLocaleString()}` },
                        { label: 'Created', value: formatDate(p.createdAt) },
                        { label: 'Tags', value: p.tags.join(', ') },
                      ]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity">
                <Card>
                  <CardContent>
                    <QueryBoundary
                      query={activity}
                      loading={<Skeleton className="h-40 w-full" />}
                      isEmpty={(events) => events.length === 0}
                      empty={<p className="py-8 text-center text-sm text-text-muted">No activity yet.</p>}
                    >
                      {(events: ActivityEvent[]) => (
                        <ActivityTimeline
                          label="Project activity"
                          items={events.map((e) => ({ id: e.id, title: e.title, description: e.description, time: e.at, timeLabel: formatRelative(e.at), icon: e.icon, tone: e.tone }))}
                        />
                      )}
                    </QueryBoundary>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tasks">
                <TasksTable />
              </TabsContent>
            </Tabs>
          </>
        )}
      </QueryBoundary>
    </PageContainer>
  );
}
