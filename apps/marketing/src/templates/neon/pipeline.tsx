import { IconRenderer, PipelineDiagram, Reveal, type PipelineNode } from '@nexus/ui/marketing';
import { NeonHeading } from './heading';

interface Stage {
  id: string;
  label: string;
  description: string;
  icon: string;
}

/** Two rows of three, snaking left to right then right to left. */
const positions: Array<[number, number]> = [
  [16, 26],
  [50, 26],
  [84, 26],
  [84, 74],
  [50, 74],
  [16, 74],
];

export function NeonPipeline({ stages }: { stages: Stage[] }) {
  const nodes: PipelineNode[] = stages.map((s, i) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    icon: <IconRenderer name={s.icon} className="size-5" />,
    x: positions[i]![0],
    y: positions[i]![1],
  }));
  const edges = stages.slice(0, -1).map((s, i) => ({ from: s.id, to: stages[i + 1]!.id }));
  return (
    <section id="pipeline" aria-labelledby="pipeline-title" className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <NeonHeading id="pipeline-title" eyebrow="Architecture" description="Each stage is observable and replaceable. Watch a question travel from raw documents to an evaluated answer.">
        One pipeline, six observable stages
      </NeonHeading>
      <Reveal distance={32}>
        <PipelineDiagram title="Retrieval pipeline: ingest, chunk, embed, retrieve, generate, evaluate" nodes={nodes} edges={edges} aspect={2.1} />
      </Reveal>
    </section>
  );
}
