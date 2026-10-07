import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { enterprise } from '../../content/enterprise';
import { CaseStudies } from './case-studies';
import { ComparisonTable } from './comparison-table';
import { EditorialHero } from './hero';
import { SecurityGrid } from './security-grid';

describe('editorial template', () => {
  it('has exactly one h1 in the hero and decorative art is hidden from assistive tech', () => {
    const { container } = render(<EditorialHero proof={enterprise.proof} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const exposed = [...container.querySelectorAll('svg')].filter((svg) => !svg.closest('[aria-hidden="true"]'));
    expect(exposed).toHaveLength(0);
  });

  it('keeps the comparison table in a focusable labelled scroll region', () => {
    render(<ComparisonTable comparison={enterprise.comparison} />);
    const region = screen.getByRole('region', { name: /comparison table/i });
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(within(region).getAllByRole('row')).toHaveLength(enterprise.comparison.rows.length + 1);
  });

  it('renders every case study as a labelled carousel slide with a pause control', () => {
    render(<CaseStudies cases={enterprise.cases} />);
    expect(screen.getByRole('region', { name: 'Customer case studies' })).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(enterprise.cases.length);
    expect(screen.getByRole('button', { name: /automatic slide rotation/i })).toBeTruthy();
  });

  it('lists every security control', () => {
    render(<SecurityGrid items={enterprise.security} />);
    for (const s of enterprise.security) expect(screen.getByText(s.title)).toBeTruthy();
  });
});
