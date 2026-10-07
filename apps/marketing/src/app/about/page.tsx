import { FeatureGrid, PageHero, SectionShell, StatsBand, TeamGrid, Timeline, Button, CurvedSection } from '@nexus/ui/marketing';
import Link from 'next/link';
import { Page } from '../../components/page';
import { aboutStats, team, timeline, values } from '../../content/about';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'About', description: 'Our mission, values, history and the team behind Nexus.', path: '/about' });

export default function AboutPage() {
  return (
    <Page cta={false}>
      <PageHero eyebrow="About" title="We build the product shell so you can build the product" description="Our mission is to make a polished, accessible admin the starting point of every project rather than the last thing finished." />
      <StatsBand stats={aboutStats} />
      <FeatureGrid id="values" eyebrow="Values" title="What we care about" features={values} />
      <CurvedSection tone="surface" curve="both">
        <SectionShell id="story" eyebrow="Our story" title="How we got here" align="left" className="max-w-3xl">
          <Timeline label="Company timeline" items={timeline} />
        </SectionShell>
      </CurvedSection>
      <TeamGrid id="team" eyebrow="Team" title="The people behind Nexus" description="A small team of engineers and designers." members={team} />
      <SectionShell id="careers" title="Join us" description="We are a small, remote-friendly team. If accessible interfaces and calm engineering sound like your kind of work, we would like to hear from you.">
        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">Introduce yourself</Link>
          </Button>
        </div>
      </SectionShell>
    </Page>
  );
}
