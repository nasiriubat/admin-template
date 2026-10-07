'use client';

import { TagInput } from '@nexus/ui';
import { isValidDomain, normalizeDomain } from './schemas';

/** Allowed-domain list: the shared TagInput with domain normalisation and validation. */
export function DomainTagInput({
  value,
  onChange,
  ...rest
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}) {
  return (
    <TagInput
      {...rest}
      value={value}
      onChange={(tags) => onChange(Array.from(new Set(tags.map(normalizeDomain))))}
      validate={(tag, current) => {
        const domain = normalizeDomain(tag);
        if (!isValidDomain(domain)) return `“${tag}” is not a valid domain, for example example.com.`;
        if (current.map(normalizeDomain).includes(domain)) return `${domain} is already in the list.`;
        return true;
      }}
      placeholder={value.length ? 'Add another' : 'example.com'}
    />
  );
}
