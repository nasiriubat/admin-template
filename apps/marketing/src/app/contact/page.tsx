import { PageHero, Reveal } from '@nexus/ui/marketing';
import { ContactForm } from '@nexus/ui/marketing-contact';
import { Page } from '../../components/page';
import { contactEmail, pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({ title: 'Contact', description: 'Talk to the team about sales, support, partnerships or security.', path: '/contact' });

const details = [
  { label: 'Sales', value: 'Plans, demos and custom agreements. We reply within one business day.' },
  { label: 'Support', value: 'Questions about using the framework. Include your version number.' },
  { label: 'Security', value: 'Report a vulnerability privately. Please do not open a public issue.' },
];

export default function ContactPage() {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || undefined;
  return (
    <Page cta={false}>
      <PageHero eyebrow="Contact" title="How can we help?" description="Send us a message and the right person will get back to you." />
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1fr_20rem]">
        <Reveal>
          <ContactForm endpoint={endpoint} fallbackEmail={contactEmail} />
        </Reveal>
        <Reveal as="div" direction="left" delay={0.1}>
        <aside aria-label="Contact details" className="space-y-6 rounded-card border border-border bg-surface p-6 shadow-card">
          <p>
            <span className="block text-sm font-semibold">Email</span>
            <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">
              {contactEmail}
            </a>
          </p>
          {details.map((d) => (
            <p key={d.label}>
              <span className="block text-sm font-semibold">{d.label}</span>
              <span className="text-sm text-text-muted">{d.value}</span>
            </p>
          ))}
        </aside>
        </Reveal>
      </div>
    </Page>
  );
}
