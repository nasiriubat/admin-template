import type { CaseStudy } from '@nexus/ui';

export const caseStudies: CaseStudy[] = [
  { company: 'Parcel Freight', industry: 'Logistics', headline: 'Three internal dashboards became one admin', summary: 'Parcel Freight replaced separate dispatch, billing and support tools with one Nexus-based application that dispatchers use on tablets in the warehouse.', metrics: [{ value: '3 → 1', label: 'tools consolidated' }, { value: '40%', label: 'faster onboarding' }] },
  { company: 'Helix Health', industry: 'Healthcare operations', headline: 'A security review passed on the first attempt', summary: 'Role-aware navigation, an exportable audit log and strict headers let Helix Health answer its security questionnaire with evidence from the product itself.', metrics: [{ value: '1st', label: 'review pass' }, { value: '6 wks', label: 'saved on audit tooling' }] },
  { company: 'Lumen Studio', industry: 'Creative agency', headline: 'One framework for every client project', summary: 'Lumen Studio ships a branded admin and matching landing page for each client by changing tokens and enabling modules.', metrics: [{ value: '9', label: 'client launches' }, { value: '2 days', label: 'average setup' }] },
];

export const customerLogos = ['Parcel Freight', 'Helix Health', 'Lumen Studio', 'Northwind', 'Atlas', 'Vertex'];

export const customerQuote = { quote: 'Dark mode, mobile and keyboard support were already done. We only had to add our own modules.', name: 'Riley Nguyen', role: 'Founder, Lumen Studio' };
