import type { Config } from 'tailwindcss';

/**
 * Shared Tailwind preset: maps every design token (CSS variable) to a utility so feature
 * code never hard-codes colours. Consumed by apps/admin and apps/marketing.
 */
const withAlpha = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;
const semantic = (name: string) => ({
  DEFAULT: withAlpha(name),
  foreground: `var(--${name}-foreground)`,
});

const preset: Partial<Config> = {
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: withAlpha('canvas'),
        surface: { DEFAULT: withAlpha('surface'), elevated: withAlpha('surface-elevated') },
        border: { DEFAULT: withAlpha('border'), strong: 'rgb(var(--text-muted-rgb) / 0.7)' },
        text: { DEFAULT: withAlpha('text'), muted: withAlpha('text-muted') },
        primary: semantic('primary'),
        secondary: semantic('secondary'),
        accent: semantic('accent'),
        success: semantic('success'),
        warning: semantic('warning'),
        danger: semantic('danger'),
        info: semantic('info'),
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'calc(var(--radius-xl) + 0.25rem)',
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
      },
      fontFamily: { sans: ['var(--font-family-sans)', 'sans-serif'] },
      height: { input: 'var(--input-height)', topbar: 'var(--topbar-height)' },
      minHeight: { row: 'var(--row-height)' },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
        popover: '0 10px 30px -8px rgb(0 0 0 / 0.25)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'dialog-in': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.97)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'dialog-out': {
          from: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          to: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.97)' },
        },
        'sheet-right-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'sheet-right-out': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'sheet-left-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'sheet-left-out': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        'sheet-bottom-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'sheet-bottom-out': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(100%)' } },
        'pop-in': { from: { opacity: '0', transform: 'translateY(-4px) scale(0.98)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 120ms ease-in',
        'dialog-in': 'dialog-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dialog-out': 'dialog-out 140ms ease-in',
        'sheet-right-in': 'sheet-right-in 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-right-out': 'sheet-right-out 180ms ease-in',
        'sheet-left-in': 'sheet-left-in 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-left-out': 'sheet-left-out 180ms ease-in',
        'sheet-bottom-in': 'sheet-bottom-in 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-bottom-out': 'sheet-bottom-out 200ms ease-in',
        'pop-in': 'pop-in 140ms ease-out',
      },
    },
  },
};

export default preset;
