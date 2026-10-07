export type BillingCycle = 'monthly' | 'yearly';

export interface PlanDef {
  id: string;
  name: string;
  description: string;
  /** Monthly price in whole currency units; null means "custom" (contact sales). */
  monthly: number | null;
  /** Effective per-month price when billed yearly. */
  yearly: number | null;
  featured?: boolean;
  highlights: string[];
  cta: { label: string; href: string };
}

export type MatrixValue = boolean | string;
export interface MatrixGroup {
  title: string;
  rows: Array<{ label: string; values: Record<string, MatrixValue> }>;
}

export function planPrice(plan: PlanDef, cycle: BillingCycle): number | null {
  return cycle === 'yearly' ? plan.yearly : plan.monthly;
}

export function formatPrice(amount: number | null, currency = '$'): string {
  if (amount === null) return 'Custom';
  return amount === 0 ? `${currency}0` : `${currency}${amount.toLocaleString('en-US')}`;
}

/** Whole-number discount of yearly vs monthly billing, or 0 when not applicable. */
export function yearlySavingsPercent(plan: Pick<PlanDef, 'monthly' | 'yearly'>): number {
  if (!plan.monthly || plan.yearly === null || plan.yearly >= plan.monthly) return 0;
  return Math.round((1 - plan.yearly / plan.monthly) * 100);
}

/** Largest discount across plans, for the toggle badge. */
export function maxSavingsPercent(plans: PlanDef[]): number {
  return plans.reduce((max, p) => Math.max(max, yearlySavingsPercent(p)), 0);
}
