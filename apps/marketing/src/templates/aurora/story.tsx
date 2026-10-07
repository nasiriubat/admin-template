import { StickyShowcase } from '@nexus/ui/marketing';
import { ProductPreview } from '../../components/product-preview';
import { Band } from './band';

interface Step {
  icon: string;
  title: string;
  description: string;
}

/** Scroll story: copy scrolls while the product preview stays pinned and swaps (shared StickyShowcase). */
export function AuroraStory({ steps }: { steps: Step[] }) {
  return (
    <Band tone="canvas" next="primary" wave="curve" labelledBy="workflow-title">
      <StickyShowcase
        id="workflow"
        eyebrow="Workflow"
        title="From config file to production"
        description="Three steps, no custom design system required."
        steps={steps.map((s, i) => ({ ...s, visual: <ProductPreview compact highlight={i} /> }))}
      />
    </Band>
  );
}
