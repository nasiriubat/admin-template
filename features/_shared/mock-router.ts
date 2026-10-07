import { createMockRouter } from '@nexus/api-client';

/** Single in-memory router that every feature's `mock.ts` registers its routes on (demo mode only). */
export const mockRouter = createMockRouter();
