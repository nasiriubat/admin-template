import type { ContentBlock } from '@nexus/ui';

export interface LegalDoc {
  title: string;
  description: string;
  /** ISO date. */
  updated: string;
  blocks: ContentBlock[];
}

export const privacy: LegalDoc = {
  title: 'Privacy policy',
  description: 'How this site collects, uses and protects personal information.',
  updated: '2026-10-01',
  blocks: [
    { type: 'p', text: 'This template explains in plain language what information a website collects and why. Replace the bracketed details with your own before publishing.' },
    { type: 'h2', text: 'Information we collect' },
    { type: 'ul', items: ['Details you give us, such as your name, email address and message when you use the contact form.', 'Basic technical data, such as browser type and pages visited, if you enable analytics.'] },
    { type: 'h2', text: 'How we use information' },
    { type: 'p', text: 'We use your details to reply to your enquiry, to operate and secure the site, and to improve the product. We do not sell personal information.' },
    { type: 'h2', text: 'Sharing and processors' },
    { type: 'p', text: 'We share information only with service providers who process it on our behalf, such as email delivery, and only as needed to provide the service.' },
    { type: 'h2', text: 'Retention' },
    { type: 'p', text: 'We keep enquiries for as long as needed to respond and for a reasonable period afterwards, then delete them.' },
    { type: 'h2', text: 'Your rights' },
    { type: 'p', text: 'Depending on where you live you may have the right to access, correct, export or delete your information, and to object to certain processing. Contact us to make a request.' },
    { type: 'h2', text: 'Contact' },
    { type: 'p', text: 'Questions about this policy can be sent through the contact page.' },
  ],
};

export const terms: LegalDoc = {
  title: 'Terms of service',
  description: 'The terms that apply when you use this website and its services.',
  updated: '2026-10-01',
  blocks: [
    { type: 'p', text: 'This template sets out the basic terms for using a website or service. Adapt each section to your product and jurisdiction before publishing.' },
    { type: 'h2', text: 'Using the service' },
    { type: 'p', text: 'You agree to use the service lawfully and not to interfere with its operation or security. You are responsible for activity under your account.' },
    { type: 'h2', text: 'Accounts and payment' },
    { type: 'p', text: 'Paid plans renew automatically unless cancelled before the renewal date. Fees are stated at purchase and exclude applicable taxes.' },
    { type: 'h2', text: 'Intellectual property' },
    { type: 'p', text: 'We own the service and its content. You keep ownership of the data you submit and grant us the limited rights needed to operate the service for you.' },
    { type: 'h2', text: 'Availability and warranties' },
    { type: 'p', text: 'The service is provided as is. We aim for high availability but do not guarantee uninterrupted operation, except as stated in a written service agreement.' },
    { type: 'h2', text: 'Limitation of liability' },
    { type: 'p', text: 'To the extent permitted by law, our total liability is limited to the fees you paid in the twelve months before the claim.' },
    { type: 'h2', text: 'Changes and termination' },
    { type: 'p', text: 'We may update these terms and will give notice of material changes. Either party may end the agreement as described in your plan.' },
  ],
};
