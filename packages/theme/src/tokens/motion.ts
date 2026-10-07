/**
 * Motion tokens per docs/MOTION.md:
 * - fast: 150ms
 * - normal: 250ms
 * - slow: 500ms
 * - page: 450ms
 * Intensities: Minimal, Standard, Expressive
 * Respect prefers-reduced-motion.
 */

export type MotionIntensity = 'minimal' | 'standard' | 'expressive';

export const motionDurations = {
  fast: 0.15, // 150ms
  normal: 0.25, // 250ms
  slow: 0.5, // 500ms
  page: 0.45, // 450ms
} as const;

export const motionEasings = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  softSpring: {
    type: 'spring' as const,
    stiffness: 250,
    damping: 25,
  },
} as const;

export const motionMultiplier: Record<MotionIntensity, number> = {
  minimal: 0.5,
  standard: 1.0,
  expressive: 1.35,
};
