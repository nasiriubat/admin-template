import { type Variants, type Transition } from 'framer-motion';

/**
 * Standard transition definitions honoring the motion system
 */
export const defaultSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
};

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const standardEaseOut: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

export const fastEaseOut: Transition = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Sidebar expand / collapse animation variants
 */
export const sidebarVariants: Variants = {
  expanded: {
    width: 260,
    transition: defaultSpring,
  },
  collapsed: {
    width: 76,
    transition: defaultSpring,
  },
};

/**
 * Mobile Drawer / Sheet animation variants
 */
export const drawerVariants: Variants = {
  closed: {
    x: '-100%',
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
};

export const bottomSheetVariants: Variants = {
  closed: {
    y: '100%',
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
  open: {
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 35 },
  },
};

export const backdropVariants: Variants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

/**
 * Top bar popover / dropdown animation variants
 */
export const popoverVariants: Variants = {
  closed: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: fastEaseOut,
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: standardEaseOut,
  },
};

/**
 * Tab and item active indicator layout animation
 */
export const activeIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 35,
};

/**
 * Page entrance transition
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.2,
    },
  },
};
