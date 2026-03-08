import { useTranslation } from '../i18n/useTranslation';

const DEFAULT_PAGE_SIZE = 12;

export interface PaginationProps {
  /** Total number of items */
  totalItems: number;
  /** Current 1-based page */
  currentPage: number;
  /** Callback when page changes (1-based) */
  onPageChange: (page: number) => void;
  /** Items per page */
  pageSize?: number;
  /** Optional class for the wrapper */
  className?: string;
}

/**
 * Builds an array of page numbers to show, with ellipsis for long ranges.
 * e.g. [1, 2, 3, '...', 10, 11, 12, '...', 98, 99, 100]
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [];
  const showEdge = 2;
  const showAround = 1;

  if (currentPage <= showEdge + showAround + 1) {
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);
    if (totalPages > 5) {
      pages.push('ellipsis');
      for (let i = totalPages - 1; i <= totalPages; i++) pages.push(i);
    }
  } else if (currentPage >= totalPages - showEdge - showAround) {
    pages.push(1, 2);
    pages.push('ellipsis');
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2);
    pages.push('ellipsis');
    for (let i = currentPage - showAround; i <= currentPage + showAround; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(totalPages - 1, totalPages);
  }
  return pages;
}

export default function Pagination({
  totalItems,
  currentPage,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const showingText = t('pagination.showingRange')
    .replace('{{start}}', String(start))
    .replace('{{end}}', String(end))
    .replace('{{total}}', String(totalItems));

  if (totalItems === 0) return null;
  if (totalPages <= 1) {
    return (
      <p className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
        {showingText}
      </p>
    );
  }

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      aria-label="Pagination"
    >
      <p className="text-sm text-neutral-600 dark:text-neutral-400 order-2 sm:order-1">
        {showingText}
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="btn btn-outline text-sm px-3 py-1.5 disabled:opacity-50 disabled:pointer-events-none"
          aria-label={t('pagination.previous')}
        >
          {t('pagination.previous')}
        </button>
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-neutral-400 dark:text-neutral-500">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                  p === safePage
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
                aria-label={t('pagination.pageLabel').replace('{{page}}', String(p))}
                aria-current={p === safePage ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="btn btn-outline text-sm px-3 py-1.5 disabled:opacity-50 disabled:pointer-events-none"
          aria-label={t('pagination.next')}
        >
          {t('pagination.next')}
        </button>
      </div>
    </nav>
  );
}

export { DEFAULT_PAGE_SIZE };
