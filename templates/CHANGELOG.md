# Changelog

All notable changes to this product should be documented here.

## Unreleased

### Added

- Module system with permission-aware navigation, route guards and breadcrumbs
- Auth package (cookie-session adapter, demo adapter), typed API client with mock router
- Shared UI: buttons, forms, dialogs, sheets, command palette, data table, filters, charts, state patterns
- Modules: AI (providers, models, prompts, usage), knowledge base, billing (optional), file download, dashboard, analytics, users, roles, audit, health, logs, jobs, files, feature flags, API keys, webhooks, settings, theme editor, notifications, profile
- Marketing app with SaaS, AI and Enterprise templates (GSAP scroll scenes)
- Security headers with nonce-based CSP, Dockerfile, CI workflow, unit and E2E tests

### Changed

- Shell is now mounted once per layout instead of per page
- Semantic colour tokens adjusted so every preset meets WCAG AA contrast
- Service worker no longer caches HTML or API responses

### Fixed

- Mobile menu closed itself immediately after opening
- Sidebar and top bar were not sticky
- Navigation links pointed at routes that did not exist
- Service worker registration could silently never run
- Theme flash on first paint and crash on corrupted stored settings

## 1.0.0

Initial public release.
