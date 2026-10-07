import { Carousel, CurvedSection, Reveal, SectionShell, IconRenderer } from '@nexus/ui/marketing';
import { phoneScreens } from '../../content/product';
import { PhoneDevice } from './phone-screen';

/** Horizontally scrolling carousel of phone screens inside a curved surface band. */
export function ScreensCarousel() {
  return (
    <CurvedSection id="screens" tone="surface" curve="both" className="scroll-mt-20">
      <SectionShell eyebrow="Screens" title="Designed for the thumb" description="Swipe through the mobile experience. Every screen is a real module, not a squeezed desktop page." className="py-8 md:py-12">
        <Reveal>
          <Carousel label="Mobile screens" slideClassName="basis-[72%] min-[520px]:basis-1/2 lg:basis-1/4" className="-mx-4 px-4 md:mx-0 md:px-0">
            {phoneScreens.map((s) => (
              <figure key={s.id} className="px-1 py-4">
                <PhoneDevice screen={s} className="max-w-[15rem]" />
                <figcaption className="mx-auto mt-5 max-w-[15rem] text-center">
                  <span className="mx-auto mb-2 grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <IconRenderer name={s.icon} className="size-4" />
                  </span>
                  <span className="block font-semibold">{s.tagline}</span>
                  <span className="mt-1 block text-sm text-text-muted">{s.description}</span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </Reveal>
      </SectionShell>
    </CurvedSection>
  );
}
