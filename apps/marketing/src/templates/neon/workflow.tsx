import { CurvedSection, StickyShowcase } from '@nexus/ui/marketing';
import { ProductPreview } from '../../components/product-preview';

interface Step {
  icon: string;
  title: string;
  description: string;
}

/**
 * Light-on-dark interlude: a curved canvas-coloured panel whose corners reveal the dark page.
 * `overflow-visible` keeps the showcase's sticky visual working.
 */
export function NeonWorkflow({ steps }: { steps: Step[] }) {
  return (
    <CurvedSection id="showcase" curve="both" tone="canvas" outerTone="secondary" className="overflow-visible text-text" contentClassName="py-4">
      <StickyShowcase
        eyebrow="Workspace"
        title="Everything in one place"
        description="Sources, prompts and evaluations share one workspace, so quality never regresses silently."
        steps={steps.map((s, i) => ({ ...s, visual: <ProductPreview compact highlight={i} /> }))}
      />
    </CurvedSection>
  );
}
