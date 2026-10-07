import { describe, expect, it } from 'vitest';
import { ZOOM_PEAK, ease, heroFrame, visibleBetween, windowProgress, zoomCaptionIndex, zoomScale } from './scroll-math';

describe('scroll math', () => {
  it('clamps window progress and eases between 0 and 1', () => {
    expect(windowProgress(-1, 0, 1)).toBe(0);
    expect(windowProgress(2, 0, 1)).toBe(1);
    expect(windowProgress(0.5, 0, 1)).toBe(0.5);
    expect(ease(0.5)).toBe(0.5);
    expect(ease(-3)).toBe(0);
  });

  it('flattens the hero device as it scrolls into view', () => {
    expect(heroFrame(0)).toEqual({ rotateX: 16, scale: 0.88, y: 40 });
    expect(heroFrame(1)).toEqual({ rotateX: 0, scale: 1, y: 0 });
  });

  it('zooms in to the peak and back out to 1', () => {
    expect(zoomScale(0)).toBe(1);
    expect(zoomScale(0.5)).toBeCloseTo(ZOOM_PEAK);
    expect(zoomScale(1)).toBeCloseTo(1);
    expect(zoomScale(0.28)).toBeGreaterThan(1);
    expect(zoomScale(0.28)).toBeLessThan(ZOOM_PEAK);
  });

  it('picks the right caption and fades at window edges', () => {
    expect([zoomCaptionIndex(0), zoomCaptionIndex(0.4), zoomCaptionIndex(0.9)]).toEqual([0, 1, 2]);
    expect(visibleBetween(0.4, 0.2, 0.6)).toBe(1);
    expect(visibleBetween(0.2, 0.2, 0.6)).toBe(0);
    expect(visibleBetween(0.23, 0.2, 0.6)).toBeCloseTo(0.5);
  });
});
