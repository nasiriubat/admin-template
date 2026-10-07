# Email templates

Table-based, inline-styled HTML that renders in major mail clients (including Outlook and dark-mode clients).
Placeholders use `{{double_braces}}`: replace them with your mail library's variables (Handlebars, Jinja, Blade, Mustache...).
HTML-escape every substituted value, especially names and addresses.

| File | Purpose | Variables |
| --- | --- | --- |
| `invite.html` | Workspace invitation | `app_name inviter_name role expires_in action_url` |
| `password-reset.html` | Password reset | `app_name email action_url` |
| `invoice.html` | Payment receipt | `app_name invoice_number amount date plan_name action_url` |
| `security-alert.html` | New sign-in notice | `app_name device location time action_url` |

Common: `title preheader support_line company_name company_address`. Colours are literal here (email clients ignore CSS
variables); change `#4f46e5` to your brand colour. Always send a plain-text alternative and include an unsubscribe or
notification-settings link for non-transactional messages.
