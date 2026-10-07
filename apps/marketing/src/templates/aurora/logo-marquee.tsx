import { Marquee } from '@nexus/ui/marketing';

export function LogoMarquee({ logos }: { logos: string[] }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-16 md:px-6 md:pt-24">
      <p className="mb-6 text-center text-sm font-medium text-text-muted">Trusted by product teams at</p>
      <Marquee label="Customer companies" speed={36} gap={64}>
        {logos.map((name) => (
          <span key={name} className="flex items-center gap-2 text-xl font-semibold tracking-tight text-text-muted">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-6 fill-primary/70">
              <path d="M12 2 22 12 12 22 2 12Z" />
            </svg>
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
