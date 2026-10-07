import { z } from 'zod';

// Zod 4 probes `new Function()` to JIT-compile validators. Our Content-Security-Policy (correctly)
// forbids eval, so every page would log a CSP violation. Jitless mode is plenty fast for forms.
z.config({ jitless: true });

export { z };
export type { ZodType } from 'zod';
