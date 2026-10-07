# Suggested Repository Structure

```text
nexus-admin/

apps/
  admin/
  marketing/

packages/
  ui/
  theme/
  motion/
  charts/
  forms/
  tables/
  icons/
  auth/
  permissions/
  notifications/
  api-client/
  config/

features/
  users/
  roles/
  settings/
  audit/
  files/
  logs/
  jobs/
  health/
  feature-flags/
  api-keys/
  webhooks/
  ai/
  knowledge/

public/

docs/

tests/
```

A monorepo is recommended for the product repository.

Client projects can consume the packages directly or start from a distribution build depending on the licensing model.
