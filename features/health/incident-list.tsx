import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, formatDateTime, formatRelative } from '@nexus/ui';
import { formatMinutes, incidentDurationMinutes, splitIncidents } from './health-utils';
import { INCIDENT_STATUS_LABEL, STATUS_META, type HealthService, type Incident } from './types';

function IncidentItem({ incident, services, now }: { incident: Incident; services: HealthService[]; now: number }) {
  const names = incident.serviceIds.map((id) => services.find((s) => s.id === id)?.name ?? id).join(', ');
  const open = incident.status !== 'resolved';
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-text">{incident.title}</h4>
        <Badge variant={open ? STATUS_META[incident.severity].variant : 'neutral'}>{INCIDENT_STATUS_LABEL[incident.status]}</Badge>
      </div>
      <p className="mt-1 text-xs text-text-muted">
        {names} · started {formatRelative(incident.startedAt, now)} · {open ? 'ongoing for' : 'lasted'} {formatMinutes(incidentDurationMinutes(incident, now))}
      </p>
      <ol className="mt-3 space-y-3 border-l border-border pl-4" aria-label={`Timeline for ${incident.title}`}>
        {incident.updates.map((update) => (
          <li key={`${update.at}-${update.status}`} className="relative text-sm">
            <span aria-hidden="true" className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-border-strong" />
            <p className="text-text">
              <span className="font-medium">{INCIDENT_STATUS_LABEL[update.status]}.</span> {update.message}
            </p>
            <time dateTime={update.at} className="text-xs text-text-muted">
              {formatDateTime(update.at)}
            </time>
          </li>
        ))}
      </ol>
    </li>
  );
}

export function IncidentList({ incidents, services, now }: { incidents: Incident[]; services: HealthService[]; now: number }) {
  const { open, resolved } = splitIncidents(incidents);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Open incidents</CardTitle>
          <CardDescription>Issues we are working on right now.</CardDescription>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <EmptyState icon="CheckCircle2" title="No open incidents" description="Everything is running normally." />
          ) : (
            <ul className="divide-y divide-border">{open.map((i) => <IncidentItem key={i.id} incident={i} services={services} now={now} />)}</ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resolved incidents</CardTitle>
          <CardDescription>Past 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {resolved.length === 0 ? (
            <EmptyState icon="Clock" title="No resolved incidents" description="Nothing has been reported in the past 30 days." />
          ) : (
            <ul className="divide-y divide-border">{resolved.map((i) => <IncidentItem key={i.id} incident={i} services={services} now={now} />)}</ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
