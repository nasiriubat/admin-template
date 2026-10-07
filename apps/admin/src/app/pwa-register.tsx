'use client';

import { useEffect } from 'react';

/** Registers the service worker in production only (a dev SW serves stale bundles and hides HMR). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    };
    // `load` may already have fired by the time this effect runs.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);
  return null;
}
