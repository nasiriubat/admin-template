'use client';

import { AnimatedPath, Parallax, toneFill, toneStroke } from '@nexus/ui/marketing';

const sources = [
  { y: 56, label: 'Registry' },
  { y: 150, label: 'Instruments' },
  { y: 244, label: 'Partner feed' },
];

/** Back layer: soft lake surface made of overlapping waves. */
function LakeLayer() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 480 400" className="size-full" preserveAspectRatio="xMidYMid slice">
      <path className={`${toneFill.info} opacity-10`} d="M0 250 C80 220 160 290 240 255 C330 215 400 280 480 245 V400 H0 Z" />
      <path className={`${toneFill.primary} opacity-10`} d="M0 300 C90 270 170 340 260 305 C340 272 410 330 480 300 V400 H0 Z" />
      <path className={`${toneFill.success} opacity-10`} d="M0 350 C100 325 190 385 280 355 C360 330 420 375 480 352 V400 H0 Z" />
    </svg>
  );
}

/** Middle layer: sources, the governed lake and the report card. */
function StructureLayer() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 480 400" className="size-full" preserveAspectRatio="xMidYMid meet">
      {sources.map((s) => (
        <g key={s.label}>
          <rect x="16" y={s.y} width="104" height="56" rx="14" className={`${toneFill.elevated} ${toneStroke.border}`} strokeWidth="1.5" />
          <rect x="30" y={s.y + 16} width="48" height="6" rx="3" className={`${toneFill.muted} opacity-40`} />
          <rect x="30" y={s.y + 30} width="72" height="6" rx="3" className={`${toneFill.muted} opacity-25`} />
        </g>
      ))}
      <g>
        <ellipse cx="240" cy="270" rx="62" ry="18" className={`${toneFill.primary} opacity-80`} />
        <path d="M178 150 V270 A62 18 0 0 0 302 270 V150 Z" className={`${toneFill.primary} opacity-20`} />
        <path d="M178 210 A62 18 0 0 0 302 210" className={`${toneStroke.primary} opacity-50`} fill="none" strokeWidth="1.5" />
        <path d="M178 170 A62 18 0 0 0 302 170" className={`${toneStroke.primary} opacity-50`} fill="none" strokeWidth="1.5" />
        <ellipse cx="240" cy="150" rx="62" ry="18" className={`${toneFill.primary}`} />
      </g>
      <g>
        <rect x="350" y="96" width="114" height="150" rx="16" className={`${toneFill.elevated} ${toneStroke.border}`} strokeWidth="1.5" />
        <rect x="364" y="112" width="50" height="7" rx="3.5" className={`${toneFill.muted} opacity-40`} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={366 + i * 22} y={206 - [30, 56, 40, 72][i]!} width="14" height={[30, 56, 40, 72][i]} rx="4" className={i === 3 ? toneFill.success : toneFill.info} opacity={i === 3 ? 1 : 0.6} />
        ))}
      </g>
    </svg>
  );
}

/** Front layer: self-drawing lineage lines that connect the structures. */
function LineageLayer() {
  const lines = [
    'M120 84 C170 84 170 150 178 160',
    'M120 178 C160 178 160 200 178 205',
    'M120 272 C160 272 170 250 178 245',
    'M302 190 C330 190 330 170 350 170',
  ];
  return (
    <div className="relative size-full">
      {lines.map((d, i) => (
        <AnimatedPath key={d} d={d} viewBox="0 0 480 400" tone={i === 3 ? 'success' : 'accent'} strokeWidth={2.5} delay={0.3 + i * 0.35} className="absolute inset-0 size-full" />
      ))}
    </div>
  );
}

/** Layered data-lake / lineage illustration. Each layer drifts at a different rate on scroll. Decorative. */
export function LineageIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[6/5] w-full max-w-xl">
      <Parallax offset={-20} className="absolute inset-0"><LakeLayer /></Parallax>
      <Parallax offset={-45} className="absolute inset-0"><StructureLayer /></Parallax>
      <Parallax offset={-80} className="absolute inset-0"><LineageLayer /></Parallax>
    </div>
  );
}
