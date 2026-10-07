import { PipelineDiagram, Reveal, type PipelineEdge, type PipelineNode } from '@nexus/ui/marketing';
import { SectionHeading } from './section-heading';

export interface LineageContent {
  title: string;
  description: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

/** Data lineage as a self-drawing pipeline; below md the primitive shows the same steps as a list. */
export function LineageSection({ lineage }: { lineage: LineageContent }) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6" role="group" aria-labelledby="lineage-title">
      <SectionHeading id="lineage-title" eyebrow="Data lineage" title={lineage.title} description={lineage.description} />
      <Reveal variant="scale" direction="none" className="rounded-3xl border border-border bg-canvas p-4 md:p-8">
        <PipelineDiagram title="How a published result traces back to source data" nodes={lineage.nodes} edges={lineage.edges} edgeTone="primary" aspect={2.4} />
      </Reveal>
    </div>
  );
}
