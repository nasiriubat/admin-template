/** Script and stage logic for the animated agent demo (kept separate so it is unit-testable). */
export const demoScript = {
  workspace: 'support-docs',
  prompt: 'refund-policy@v3',
  question: 'Can a customer on an annual plan get a refund after 30 days?',
  tool: 'search_index',
  sources: ['Refund policy', 'Billing FAQ', 'Annual plan terms'],
  answer: 'Annual plans are refundable within 30 days of purchase. After that, unused full months are credited to the account instead [1][2].',
  grounded: '0.96',
} as const;

/** Stages: 0 question, 1 searching, 2 sources found, 3 answer streaming, 4 complete with eval score. */
export const FINAL_STAGE = 4;

/** ms to stay on each stage before advancing. The last stage is held so the result can be read. */
export const stageDurations = [1100, 1500, 1300, 4600, 4200] as const;

/** The stage that follows `stage`; after the final stage the demo restarts. */
export function nextStage(stage: number): number {
  return stage >= FINAL_STAGE ? 0 : stage + 1;
}

export const stageDuration = (stage: number): number => stageDurations[Math.max(0, Math.min(stage, FINAL_STAGE))] ?? 1500;
