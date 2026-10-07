import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatDemo } from './chat-demo';
import { FINAL_STAGE, demoScript, nextStage, stageDuration } from './demo-script';

const original = window.matchMedia;
function stubMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
afterEach(() => {
  window.matchMedia = original;
  vi.useRealTimers();
});

describe('demo stage logic', () => {
  it('advances through every stage and then restarts', () => {
    const seen = [0];
    for (let i = 0; i < FINAL_STAGE + 1; i++) seen.push(nextStage(seen[seen.length - 1]!));
    expect(seen).toEqual([0, 1, 2, 3, 4, 0]);
  });
  it('always returns a positive duration, even for out-of-range stages', () => {
    for (const s of [-3, 0, 2, 4, 99]) expect(stageDuration(s)).toBeGreaterThan(0);
  });
});

describe('ChatDemo', () => {
  beforeEach(() => stubMotion(false));

  it('shows the full conversation with no controls under reduced motion', () => {
    stubMotion(true);
    render(<ChatDemo />);
    expect(screen.getByText(demoScript.question)).toBeTruthy();
    expect(screen.getAllByText(demoScript.answer).length).toBeGreaterThan(0);
    expect(screen.getByText(/Groundedness/)).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('starts at the question, can be paused and resumed, and advances over time', () => {
    vi.useFakeTimers();
    render(<ChatDemo />);
    expect(screen.queryByText(demoScript.tool)).toBeNull();
    const pause = screen.getByRole('button', { name: 'Pause the demo' });
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByText(demoScript.tool)).toBeTruthy();

    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: 'Play the demo' })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.queryByText(demoScript.sources[0])).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Play the demo' }));
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByText(demoScript.sources[0])).toBeTruthy();
  });
});
