# API Contract

## Principle

The admin frontend must remain backend agnostic.

The reference implementation connects through a typed API client.

## Standard response shape

Recommended:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

For errors:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {}
  }
}
```

## Pagination

Recommended parameters:

- page
- pageSize
- sort
- direction
- search
- filters

Recommended metadata:

```json
{
  "page": 1,
  "pageSize": 25,
  "total": 481,
  "pages": 20
}
```

## Auth

Support either:

- secure cookie based auth
- token based auth

The UI should not assume one authentication mechanism internally.

## Core endpoint families

- `/auth/*`
- `/users/*`
- `/roles/*`
- `/permissions/*`
- `/settings/*`
- `/notifications/*`
- `/audit/*`
- `/files/*`
- `/logs/*`
- `/jobs/*`
- `/health/*`
- `/feature-flags/*`
- `/api-keys/*`
- `/webhooks/*`

Optional AI:

- `/ai/providers/*`
- `/ai/models/*`
- `/ai/prompts/*`
- `/ai/usage/*`
- `/knowledge/*`

## Error handling

Every API call should surface:

- validation errors
- authorization errors
- network errors
- server errors
- retry state where appropriate
