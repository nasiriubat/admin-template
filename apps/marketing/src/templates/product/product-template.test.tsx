import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { phoneScreens, overviewModule, zoomCaptions } from '../../content/product';
import { DashboardMock } from './dashboard-mock';
import { PhoneDevice } from './phone-screen';
import { ScreensCarousel } from './screens-carousel';
import { ZoomStory } from './zoom-story';

describe('product template', () => {
  it('exposes each illustration as a single labelled image', () => {
    render(<DashboardMock data={overviewModule} />);
    expect(screen.getByRole('img', { name: /overview dashboard/i })).toBeTruthy();
    render(<PhoneDevice screen={phoneScreens[0]!} />);
    expect(screen.getByRole('img', { name: /orders screen/i })).toBeTruthy();
  });

  it('renders the carousel with one slide per phone screen', () => {
    render(<ScreensCarousel />);
    expect(screen.getByRole('region', { name: 'Mobile screens' })).toBeTruthy();
    expect(screen.getAllByRole('group').filter((g) => g.getAttribute('aria-roledescription') === 'slide')).toHaveLength(phoneScreens.length);
  });

  it('shows the zoom story as a readable static stack by default (no pinned scene)', () => {
    render(<ZoomStory />);
    expect(screen.getByRole('heading', { level: 2, name: /zoom in/i })).toBeTruthy();
    for (const c of zoomCaptions) expect(screen.getByText(c.title)).toBeTruthy();
  });
});
