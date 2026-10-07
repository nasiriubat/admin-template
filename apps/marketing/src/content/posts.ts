import type { ContentBlock } from '@nexus/ui';

export interface Post {
  slug: string;
  title: string;
  description: string;
  /** ISO date. */
  date: string;
  author: string;
  tags: string[];
  blocks: ContentBlock[];
}

export const posts: Post[] = [
  {
    slug: 'designing-tables-for-mobile',
    title: 'Designing admin tables that work on a phone',
    description: 'Why squeezing a desktop table into a narrow screen fails, and how record cards keep the same data usable.',
    date: '2026-09-10',
    author: 'Riley Nguyen',
    tags: ['Design', 'Mobile'],
    blocks: [
      { type: 'p', text: 'Admin interfaces are built around tables, and tables are built for wide screens. When the same table is shrunk onto a phone, the result is tiny text, sideways scrolling and columns nobody can read. The data is technically there, but the task is not achievable.' },
      { type: 'h2', text: 'Start from the task, not the column list' },
      { type: 'p', text: 'On a phone people rarely compare forty rows. They look up one record, check its status and take an action. A mobile layout should optimise for exactly that: a title, two or three key facts and one obvious action.' },
      { type: 'ul', items: ['Pick one primary field as the card title, usually a name or an identifier.', 'Show status as a labelled badge, never colour alone.', 'Keep secondary columns in a collapsible detail area.', 'Move row actions into a single menu with a 44px touch target.'] },
      { type: 'h2', text: 'Keep behaviour identical' },
      { type: 'p', text: 'Records should still sort, filter and paginate. Filters that sit in a toolbar on desktop belong in a bottom sheet on mobile, which keeps them within thumb reach and avoids covering the list.' },
      { type: 'callout', tone: 'info', title: 'Rule of thumb', text: 'If a user would need to scroll sideways to understand one row, that row should be a card.' },
      { type: 'h2', text: 'Test with the keyboard and a screen reader' },
      { type: 'p', text: 'Cards must keep a logical reading order and expose the same actions to assistive technology. A quick pass with a screen reader on the mobile layout catches most problems early.' },
    ],
  },
  {
    slug: 'design-tokens-in-practice',
    title: 'Design tokens in practice: rebranding without touching components',
    description: 'How named colour and spacing tokens let one codebase support several brands and both colour modes.',
    date: '2026-08-18',
    author: 'Amira Haddad',
    tags: ['Design', 'Engineering'],
    blocks: [
      { type: 'p', text: 'A design token is a named decision, such as the colour used for the primary action. Components refer to the name and never to a raw value, so changing the decision changes the whole product at once.' },
      { type: 'h2', text: 'Name by role, not by value' },
      { type: 'p', text: 'A token called `primary` can be blue today and green tomorrow. A token called `blue-500` cannot. Role names also make light and dark modes natural, because each role simply has two values.' },
      { type: 'code', language: 'css', code: ':root {\n  --canvas: 248 250 252;\n  --surface: 255 255 255;\n}\n.dark {\n  --canvas: 11 15 25;\n  --surface: 17 24 39;\n}' },
      { type: 'h2', text: 'Check contrast where the tokens meet' },
      { type: 'p', text: 'Contrast problems appear in pairs: text on a surface, a button label on the primary colour. Validating each pair when a theme is saved prevents unreadable combinations from ever shipping.' },
      { type: 'h2', text: 'Keep exceptions rare' },
      { type: 'p', text: 'The moment a feature hard codes a colour, the theme stops being authoritative. Treat every literal colour in a feature module as a bug to be replaced by a token.' },
    ],
  },
  {
    slug: 'audit-logs-teams-trust',
    title: 'Audit logs your security team will actually trust',
    description: 'What a useful audit trail records, how to keep it tamper evident and why it belongs in the product from day one.',
    date: '2026-07-29',
    author: 'Tomas Novak',
    tags: ['Security', 'Product'],
    blocks: [
      { type: 'p', text: 'An audit log answers four questions after something goes wrong: who did it, what changed, when and from where. If any of the four is missing, the log is a diary rather than evidence.' },
      { type: 'h2', text: 'Record the fields that matter' },
      { type: 'ul', items: ['The acting user and their role at the time.', 'The action and the affected resource identifier.', 'Before and after values for sensitive fields, with secrets masked.', 'A timestamp in UTC and the request origin.'] },
      { type: 'h2', text: 'Make it append only' },
      { type: 'p', text: 'Users with administrative rights should be able to read the log but not edit or delete entries. Writing the log from the server, not the browser, keeps it honest.' },
      { type: 'callout', tone: 'warning', title: 'Do not log secrets', text: 'Passwords, tokens and full payment details never belong in an audit entry, even masked in the interface.' },
      { type: 'h2', text: 'Make it searchable and exportable' },
      { type: 'p', text: 'Reviewers need to filter by user, action and date range, then export the result. A log nobody can query will not be used when it counts.' },
    ],
  },
];
