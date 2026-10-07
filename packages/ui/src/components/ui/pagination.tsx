import { cn } from '../../lib/utils';
import { IconRenderer } from '../icons/icon-renderer';
import { Button } from './button';
import { Select } from './input';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const sizes = pageSizeOptions.includes(pageSize) ? pageSizeOptions : [...pageSizeOptions, pageSize].sort((a, b) => a - b);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-col items-center gap-3 text-sm text-text-muted sm:flex-row sm:justify-between', className)}
    >
      <p aria-live="polite">
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total.toLocaleString()}`}
      </p>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 w-20"
            >
              {sizes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <IconRenderer name="ChevronLeft" className="size-4" />
          </Button>
          <span className="min-w-20 px-1 text-center text-text">
            Page {page} of {pages}
          </span>
          <Button variant="secondary" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            <IconRenderer name="ChevronRight" className="size-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
