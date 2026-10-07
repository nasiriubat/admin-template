# Quality and Testing

## Required test layers

### Unit tests

For:

- utility functions
- validation
- permissions
- theme transforms
- table filters

### Component tests

For:

- forms
- dialogs
- tables
- navigation
- toasts
- theme controls

### End to end tests

Critical flows:

- login
- logout
- user management
- role permission changes
- theme changes
- create edit delete flow
- mobile navigation
- filter and sort
- destructive confirmation

## Visual regression

Strongly recommended for a design focused commercial product.

Capture:

- desktop
- tablet
- mobile
- light
- dark

## Release gate

No release if:

- TypeScript build fails
- lint fails
- critical E2E tests fail
- theme pages break
- mobile navigation overlaps content
- accessibility checks expose severe issues
