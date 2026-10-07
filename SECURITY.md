# Security Policy

## Reporting a vulnerability

Please do not open a public issue. Email the maintainers (set your address here before publishing: `security@your-domain.example`)
with a description, reproduction steps and impact. We aim to acknowledge reports within 3 business days and to ship a fix or
mitigation for confirmed high-severity issues within 30 days.

## Supported versions

The latest release receives security fixes.

## Scope notes for adopters

Nexus Admin is a front-end framework. Authorization, CSRF enforcement, upload validation, rate limiting and secret storage must be
enforced by your backend. See [docs/SECURITY.md](docs/SECURITY.md) for the exact responsibilities and the hardening already
included (CSP with nonces, security headers, demo mode that fails closed, SSRF/redirect/CSV-injection protections).
Demo mode and the demo accounts must never be enabled in production.
