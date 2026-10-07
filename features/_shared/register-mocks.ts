/**
 * Side-effect imports that register every feature's mock routes. Loaded lazily by `api.ts`, and
 * only in demo mode, so production bundles that talk to a real backend never execute this code.
 */
import '../dashboard/mock';
import '../users/mock';
import '../analytics/mock';
import '../roles/mock';
import '../feature-flags/mock';
import '../audit/mock';
import '../files/mock';
import '../api-keys/mock';
import '../notifications/mock';
import '../health/mock';
import '../logs/mock';
import '../jobs/mock';
import '../settings/mock';
import '../webhooks/mock';
import '../account/mock';
import '../knowledge/mock';
import '../billing/mock';
import '../ai/mock';
import '../examples/mock';
import '../workflows/mock';
