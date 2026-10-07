import { Blob, Reveal, Timeline, type TimelineItem } from '@nexus/ui/marketing';
import { SectionHeading } from './section-heading';

/** Onboarding plan as a vertical timeline beside a quiet decorative blob. */
export function OnboardingSection({ steps }: { steps: TimelineItem[] }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 md:px-6" role="group" aria-labelledby="onboarding-title">
      <Blob tone="info" opacity={0.12} className="pointer-events-none absolute -right-24 top-0 -z-10 size-96" />
      <SectionHeading id="onboarding-title" eyebrow="Onboarding" title="From kick-off to your first reproduced result in a month" description="A guided rollout with your security and research leads in the room from the start." />
      <Reveal className="max-w-3xl">
        <Timeline label="Onboarding plan" items={steps} />
      </Reveal>
    </div>
  );
}
