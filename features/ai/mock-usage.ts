import { createRng } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { estimateCost, rangeDays } from './ai-utils';
import type { UsageConsumer, UsageRange, UsageReport } from './types';

/** [model, provider, input $/1M, output $/1M, weight] - kept in sync with the seeded model catalogue. */
const MODELS: Array<[string, string, number, number, number]> = [
  ['gpt-4o', 'OpenAI', 2.5, 10, 5],
  ['gpt-4o-mini', 'OpenAI', 0.15, 0.6, 9],
  ['claude-sonnet', 'Anthropic', 3, 15, 6],
  ['claude-haiku', 'Anthropic', 0.8, 4, 4],
  ['llama-3-8b', 'Local runtime', 0, 0, 3],
];

const CONSUMERS: Array<[string, 'user' | 'prompt']> = [
  ['Support reply drafter', 'prompt'],
  ['Avery Morgan', 'user'],
  ['Release notes summary', 'prompt'],
  ['Jordan Lee', 'user'],
  ['Ticket classifier', 'prompt'],
  ['Sam Rivera', 'user'],
  ['Knowledge base search', 'prompt'],
  ['Riley Nguyen', 'user'],
];

const rng = createRng(20260707);
const DAYS = 90;
const history = Array.from({ length: DAYS }, (_, i) => {
  const date = new Date(Date.now() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10);
  const weekday = new Date(date).getUTCDay();
  const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1;
  return { date, tokens: MODELS.map(([, , , , w]) => Math.round(w * 40_000 * weekend * (0.7 + rng.next() * 0.6) * (1 + i / 180))) };
});
const consumerSeed = CONSUMERS.map(([name, kind], i) => ({ name, kind, share: (CONSUMERS.length - i) * (0.8 + rng.next() * 0.4) }));
const shareTotal = consumerSeed.reduce((s, c) => s + c.share, 0);
const round2 = (v: number) => Math.round(v * 100) / 100;

export function buildUsageReport(range: UsageRange): UsageReport {
  const days = history.slice(-rangeDays(range));
  const names = MODELS.map(([m]) => m);
  const daily = days.map((d) => ({ date: d.date, ...Object.fromEntries(names.map((m, i) => [m, d.tokens[i]])) }));
  const perModel = MODELS.map((_, i) => days.reduce((s, d) => s + d.tokens[i], 0));
  const totalTokens = perModel.reduce((s, v) => s + v, 0);
  const tokensIn = Math.round(totalTokens * 0.72);
  const costs = MODELS.map(([, , inP, outP], i) => estimateCost(perModel[i] * 0.72, perModel[i] * 0.28, inP, outP));
  const byProvider = new Map<string, number>();
  MODELS.forEach(([, provider], i) => byProvider.set(provider, (byProvider.get(provider) ?? 0) + costs[i]));
  const cost = costs.reduce((s, v) => s + v, 0);
  const requests = Math.round(totalTokens / 1450);
  const consumers: UsageConsumer[] = consumerSeed.map((c, i) => ({
    id: `c-${i + 1}`,
    name: c.name,
    kind: c.kind,
    requests: Math.round((requests * c.share) / shareTotal),
    tokens: Math.round((totalTokens * c.share) / shareTotal),
    cost: round2((cost * c.share) / shareTotal),
  }));
  return {
    range,
    metrics: { requests, tokensIn, tokensOut: totalTokens - tokensIn, cost: round2(cost), errorRate: 1.4 + (days.length % 5) * 0.2 },
    models: names,
    daily,
    costByProvider: [...byProvider].filter(([, v]) => v > 0).map(([name, value]) => ({ name, value: round2(value) })),
    consumers,
  };
}

mockRouter.on('GET', '/ai/usage', ({ query }) => buildUsageReport((['7d', '30d', '90d'].includes(String(query.range)) ? query.range : '30d') as UsageRange));
