'use client';

import { motion } from 'framer-motion';
import { StickyShowcase, usePrefersReducedMotion } from '@nexus/ui/marketing';
import { phoneScreens, type PhoneScreenData } from '../../content/product';
import { PhoneDevice } from './phone-screen';

/** Re-mounts per step so the incoming phone fades up; plain (no initial animation) under reduced motion. */
function PhoneStage({ screen }: { screen: PhoneScreenData }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <PhoneDevice screen={screen} className="max-w-[16rem]" />
    </motion.div>
  );
}

/** Sticky showcase (pinned on desktop only by StickyShowcase): copy scrolls, the phone swaps screens. */
export function PhoneShowcase() {
  return (
    <StickyShowcase
      id="mobile"
      eyebrow="Mobile"
      title="A real app in your pocket"
      description="The same modules, rebuilt for small screens. On a phone each step simply shows its screen inline."
      steps={phoneScreens.slice(0, 3).map((s) => ({ icon: s.icon, title: s.tagline, description: s.description, visual: <PhoneStage key={s.id} screen={s} /> }))}
    />
  );
}
