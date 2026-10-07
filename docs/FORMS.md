# Forms

## Supported field types

- text
- textarea
- rich text
- number
- currency
- email
- password
- phone
- URL
- select
- multi select
- autocomplete
- checkbox
- radio
- toggle
- date
- date range
- time
- date time
- file
- image
- multiple file upload
- tags
- JSON editor
- code editor
- Markdown editor
- key value editor
- relation selector
- repeater

## Form layouts

- single column
- two column
- sectioned
- wizard
- modal
- drawer
- inline edit

## Field anatomy

Each field can have:

- label
- help text
- placeholder
- optional marker
- validation
- error message
- disabled state
- read only state
- loading state

## Validation

Use Zod schemas in the reference implementation.

Do not rely only on client validation. The backend remains authoritative.

## Long forms

Use:

- section anchors
- sticky save bar where useful
- unsaved changes warning
- autosave only when product semantics support it

## Destructive settings

Dangerous configuration changes should be separated visually from normal settings.
