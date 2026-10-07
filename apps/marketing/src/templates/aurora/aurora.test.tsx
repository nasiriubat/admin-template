import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { saas } from '../../content/saas';
import { AuroraHero, AuroraStats, AuroraTestimonials } from './index';

describe('aurora template', () => {
  it('has a single h1 and hides decorative svg from assistive tech', () => {
    const { container } = render(<AuroraHero words={saas.heroWords} logos={saas.logos} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const exposed = Array.from(container.querySelectorAll('svg')).filter((el) => !el.closest('[aria-hidden="true"]'));
    expect(exposed).toHaveLength(0);
  });

  it('keeps the final stat values in the DOM for assistive tech', () => {
    render(<AuroraStats stats={saas.stats} />);
    expect(screen.getAllByText('14').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('term')).toHaveLength(saas.stats.length);
  });

  it('renders every testimonial in an accessible carousel', () => {
    render(<AuroraTestimonials items={saas.testimonials} people={saas.people} />);
    expect(screen.getByRole('region', { name: 'Customer stories' })).toBeTruthy();
    expect(screen.getAllByRole('group', { name: new RegExp(`of ${saas.testimonials.length}$`) })).toHaveLength(saas.testimonials.length);
  });
});
