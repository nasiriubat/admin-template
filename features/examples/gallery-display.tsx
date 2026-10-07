'use client';

import {
  ActivityTimeline,
  Alert,
  Badge,
  Banner,
  ChartCard,
  CodeViewer,
  DescriptionList,
  DonutChart,
  EmptyState,
  ErrorState,
  JsonViewer,
  MetricCard,
  Progress,
  Skeleton,
  Sparkline,
  Spinner,
  Stepper,
  TimeSeriesChart,
  UnauthorizedState,
} from '@nexus/ui';
import { GallerySection, Specimen } from './gallery-section';

const SERIES = Array.from({ length: 14 }, (_, i) => ({ day: `D${i + 1}`, requests: 120 + ((i * 37) % 60) + i * 4, errors: 6 + ((i * 11) % 9) }));
const SAMPLE_JSON = { id: 'p-001', name: 'Atlas migration', owner: { name: 'Avery Morgan', active: true }, tags: ['infra', 'backend'], budget: 42000, parent: null };
const SAMPLE_CODE = `curl -X POST https://api.example.com/v1/projects \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d '{"name":"Atlas"}'`;

export function GalleryStatus() {
  return (
    <GallerySection id="feedback" title="Alerts, banners, badges and progress" description="Colour is never the only signal: every state also has text or an icon.">
      <div className="grid gap-3 md:grid-cols-2">
        <Alert variant="info" title="Info">Neutral guidance.</Alert>
        <Alert variant="success" title="Success">It worked.</Alert>
        <Alert variant="warning" title="Warning">Check this first.</Alert>
        <Alert variant="danger" title="Danger">Something failed.</Alert>
      </div>
      <Banner variant="warning" title="Scheduled maintenance">Saturday 02:00 UTC. Dismiss me with the close button.</Banner>
      <div className="flex flex-wrap gap-2">
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((v) => <Badge key={v} variant={v} dot>{v}</Badge>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Progress label="Storage" value={64} showValue />
        <Progress label="Error budget" value={92} tone="danger" showValue />
      </div>
      <Specimen label="Stepper (horizontal and vertical)">
        <div className="grid gap-6 md:grid-cols-2">
          <Stepper label="Horizontal steps" steps={[{ id: 'a', label: 'Account' }, { id: 'b', label: 'Profile' }, { id: 'c', label: 'Review' }]} current={1} />
          <Stepper label="Vertical steps" orientation="vertical" steps={[{ id: 'a', label: 'Plan', description: 'Pick a tier' }, { id: 'b', label: 'Payment', optional: true }, { id: 'c', label: 'Done' }]} current={0} />
        </div>
      </Specimen>
    </GallerySection>
  );
}

export function GalleryData() {
  return (
    <GallerySection id="data" title="Descriptions, timeline, code and JSON" description="Read-only data display primitives for detail pages and developer tools.">
      <DescriptionList items={[{ label: 'Owner', value: 'Avery Morgan' }, { label: 'Region', value: 'eu-north' }, { label: 'Notes', value: null }, { label: 'Budget', value: '$42,000' }]} />
      <ActivityTimeline
        label="Sample activity"
        items={[
          { id: '1', title: 'Deployed v1.4.0', description: 'By the release bot.', time: new Date(Date.now() - 3_600_000), icon: 'Rocket', tone: 'success' },
          { id: '2', title: 'Alert acknowledged', time: new Date(Date.now() - 86_400_000), icon: 'AlertTriangle', tone: 'warning' },
          { id: '3', title: 'Project created', time: new Date(Date.now() - 864_000_000) },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <CodeViewer code={SAMPLE_CODE} language="bash" lineNumbers label="Example request" />
        <JsonViewer data={SAMPLE_JSON} defaultExpandedDepth={2} label="Example record" />
      </div>
    </GallerySection>
  );
}

export function GalleryStates() {
  return (
    <GallerySection id="states" title="Page states" description="Every page needs loading, empty, error and unauthorized states. Use QueryBoundary to get all five.">
      <div className="grid gap-4 md:grid-cols-2">
        <Specimen label="Loading (skeleton)"><div className="space-y-2" role="status" aria-label="Loading example"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Spinner /></div></Specimen>
        <Specimen label="Empty"><EmptyState icon="Inbox" title="Nothing here yet" description="Create your first item to get started." /></Specimen>
        <Specimen label="Error"><ErrorState error={new Error('The server did not respond.')} onRetry={() => undefined} /></Specimen>
        <Specimen label="Unauthorized"><UnauthorizedState reason="forbidden" /></Specimen>
      </div>
    </GallerySection>
  );
}

export function GalleryCharts() {
  return (
    <GallerySection id="charts" title="Metric cards and charts" description="Chart colours come from tokens; each chart exposes a text summary for assistive tech.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Requests" value="12.4k" delta="+8.2%" deltaLabel="vs last week" icon="Activity"><Sparkline values={SERIES.map((s) => s.requests)} /></MetricCard>
        <MetricCard label="Error rate" value="0.8%" delta="+0.2%" invert icon="AlertTriangle" />
        <MetricCard label="Loading" value="–" loading />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ChartCard title="Requests per day" description="Last 14 days">
          <TimeSeriesChart data={SERIES} xKey="day" series={[{ key: 'requests', label: 'Requests', tone: 'primary' }, { key: 'errors', label: 'Errors', tone: 'danger' }]} summary="Requests and errors per day over the last 14 days" height={240} />
        </ChartCard>
        <ChartCard title="By status">
          <DonutChart data={[{ name: 'Active', value: 8, tone: 'success' }, { name: 'Paused', value: 3, tone: 'warning' }, { name: 'Done', value: 5, tone: 'info' }]} centerLabel="Projects" centerValue="16" summary="Projects by status: 8 active, 3 paused, 5 done" />
        </ChartCard>
      </div>
    </GallerySection>
  );
}
