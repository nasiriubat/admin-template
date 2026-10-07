import { cn } from '../../lib/utils';
import { initials } from '../../lib/format';

const sizes = { sm: 'size-7 text-[11px]', md: 'size-9 text-xs', lg: 'size-12 text-sm' } as const;

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 font-semibold text-primary',
        sizes[size],
        className,
      )}
      role="img"
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
