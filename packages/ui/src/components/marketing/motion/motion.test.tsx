import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AvatarStack,
  Carousel,
  CountUp,
  DeviceFrame,
  Marquee,
  PipelineDiagram,
  Reveal,
  RevealGroup,
  RotatingWords,
  StarRating,
  WaveDivider,
} from './index';

const original = window.matchMedia;
function stubMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}
beforeEach(() => stubMotion(false));
afterEach(() => {
  window.matchMedia = original;
  vi.useRealTimers();
});

const slides = [1, 2, 3].map((n) => <p key={n}>Slide content {n}</p>);

describe('Carousel', () => {
  it('exposes carousel semantics and slide groups', () => {
    render(<Carousel label="Customer stories">{slides}</Carousel>);
    const region = screen.getByRole('region', { name: 'Customer stories' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    const groups = screen.getAllByRole('group', { name: /of 3$/ });
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAttribute('aria-roledescription', 'slide');
  });

  it('navigates with arrow keys, buttons and dots and announces the slide', () => {
    render(<Carousel label="Stories">{slides}</Carousel>);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Slide 1 of 3');
    const region = screen.getByRole('region');
    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(status).toHaveTextContent('Slide 2 of 3');
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(status).toHaveTextContent('Slide 3 of 3'); // wraps
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(status).toHaveTextContent('Slide 1 of 3');
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
  });

  it('autoplays with a visible pause button that stops rotation', () => {
    vi.useFakeTimers();
    render(<Carousel label="Stories" autoplay interval={1000}>{slides}</Carousel>);
    const status = screen.getByRole('status');
    act(() => void vi.advanceTimersByTime(1100));
    expect(status).toHaveTextContent('Slide 2 of 3');
    const pause = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: /start automatic/i })).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(5000));
    expect(status).toHaveTextContent('Slide 2 of 3');
  });

  it('pauses autoplay while hovered', () => {
    vi.useFakeTimers();
    render(<Carousel label="Stories" autoplay interval={1000}>{slides}</Carousel>);
    fireEvent.mouseEnter(screen.getByRole('region'));
    act(() => void vi.advanceTimersByTime(4000));
    expect(screen.getByRole('status')).toHaveTextContent('Slide 1 of 3');
  });

  it('never autoplays under reduced motion but still offers a play button', () => {
    stubMotion(true);
    vi.useFakeTimers();
    render(<Carousel label="Stories" autoplay interval={1000}>{slides}</Carousel>);
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole('status')).toHaveTextContent('Slide 1 of 3');
    expect(screen.getByRole('button', { name: /start automatic/i })).toBeInTheDocument();
  });

  it('omits the autoplay control when autoplay is off', () => {
    render(<Carousel label="Stories">{slides}</Carousel>);
    expect(screen.queryByRole('button', { name: /automatic/i })).toBeNull();
  });
});

describe('Marquee', () => {
  it('duplicates content as aria-hidden, inert copy', () => {
    render(<Marquee label="Customers"><span>Acme</span><span>Globex</span></Marquee>);
    expect(screen.getAllByText('Acme')).toHaveLength(2);
    const hidden = screen.getAllByText('Acme')[1]!.closest('ul')!;
    expect(hidden).toHaveAttribute('aria-hidden', 'true');
    expect(hidden).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: /pause scrolling/i })).toBeInTheDocument();
  });

  it('toggles pause state', () => {
    render(<Marquee><span>Acme</span></Marquee>);
    fireEvent.click(screen.getByRole('button', { name: /pause scrolling/i }));
    expect(screen.getByTestId('marquee-track').style.animationPlayState).toBe('paused');
    expect(screen.getByRole('button', { name: /play scrolling/i })).toBeInTheDocument();
  });

  it('renders a single static wrapped list under reduced motion', () => {
    stubMotion(true);
    render(<Marquee label="Customers"><span>Acme</span><span>Globex</span></Marquee>);
    expect(screen.getAllByText('Acme')).toHaveLength(1);
    expect(screen.queryByTestId('marquee-track')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('CountUp', () => {
  it('keeps the final formatted value in the DOM', () => {
    render(<CountUp value={12500} suffix="+" locale="en-US" />);
    expect(screen.getAllByText('12,500+').length).toBeGreaterThan(0);
  });
  it('renders the final value under reduced motion', () => {
    stubMotion(true);
    render(<CountUp value={99.5} decimals={1} suffix="%" locale="en-US" />);
    expect(screen.getAllByText('99.5%').length).toBeGreaterThan(0);
  });
});

describe('RotatingWords', () => {
  it('exposes every word to screen readers and hides the animated copy', () => {
    const { container } = render(<h1>Build <RotatingWords words={['faster', 'safer', 'together']} /></h1>);
    expect(screen.getByText('faster, safer, together')).toHaveClass('sr-only');
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });
  it('is static under reduced motion', () => {
    stubMotion(true);
    vi.useFakeTimers();
    render(<RotatingWords words={['one', 'two']} />);
    act(() => void vi.advanceTimersByTime(10000));
    expect(screen.getAllByText('one').length).toBeGreaterThan(0);
    expect(screen.queryByText('two', { selector: '[aria-hidden] *, [aria-hidden]' })).toBeNull();
  });
});

describe('WaveDivider', () => {
  it.each(['smooth', 'layered', 'curve', 'tilt', 'zigzag'] as const)('renders an aria-hidden svg (%s)', (variant) => {
    const { container } = render(<WaveDivider variant={variant} fill="canvas" position="top" flip />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    const svg = container.querySelector('svg')!;
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fill-canvas');
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});

describe('Reveal', () => {
  it('always renders its content (visible without animation support)', () => {
    render(<Reveal direction="left" variant="blur"><p>Hello world</p></Reveal>);
    expect(screen.getByText('Hello world')).toBeVisible();
  });
  it('renders every child of a RevealGroup', () => {
    render(<RevealGroup as="ul" itemAs="li"><span>a</span><span>b</span></RevealGroup>);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('PipelineDiagram', () => {
  it('provides a text alternative listing steps and connections', () => {
    render(
      <PipelineDiagram
        title="Data flow"
        nodes={[{ id: 'a', label: 'Ingest', x: 10, y: 50 }, { id: 'b', label: 'Report', x: 90, y: 50 }]}
        edges={[{ from: 'a', to: 'b', label: 'nightly' }]}
      />,
    );
    expect(screen.getByText('Data flow')).toBeInTheDocument();
    expect(screen.getByText('Connects to Report (nightly).')).toBeInTheDocument();
  });
});

describe('small primitives', () => {
  it('StarRating has a text value', () => {
    render(<StarRating value={4.5} reviewCount={1200} />);
    expect(screen.getByRole('img', { name: /Rated 4.5 out of 5/ })).toBeInTheDocument();
  });
  it('AvatarStack summarises overflow', () => {
    render(<AvatarStack max={2} people={[{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { name: 'Grace Hopper' }]} />);
    expect(screen.getByRole('group', { name: /3 people/ })).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
  it('DeviceFrame renders children and hides chrome', () => {
    const { container } = render(<DeviceFrame url="x.test"><p>Screen</p></DeviceFrame>);
    expect(screen.getByText('Screen')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('x.test');
  });
});
