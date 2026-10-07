import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { playful } from '../../content/playful';
import { FaqSection } from './faq-section';
import { PlayfulHero } from './hero';
import { PricingSection } from './pricing-section';

describe('playful template', () => {
  it('renders one h1 and lets people pause the looping animation', () => {
    render(<PlayfulHero {...playful.hero} people={playful.people} stickers={playful.stickers} phone={playful.phone} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const btn = screen.getByRole('button', { name: 'Pause animations' });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: 'Play animations' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('highlights exactly one pricing plan', () => {
    render(<PricingSection plans={playful.pricing} />);
    expect(screen.getAllByText('Most loved')).toHaveLength(1);
  });

  it('renders the FAQ as native disclosure widgets', () => {
    const { container } = render(<FaqSection items={playful.faq} />);
    expect(container.querySelectorAll('details')).toHaveLength(playful.faq.length);
  });
});
