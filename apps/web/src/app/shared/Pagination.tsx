import { PaginationButton } from "./PaginationButton";

const MAX_VISIBLE_PAGES = 7;
const ELLIPSIS = "…" as const;

type PageItem = number | typeof ELLIPSIS;

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pageItems: PageItem[] = [1];

  const firstMiddlePage = Math.max(2, currentPage - 1);
  const lastMiddlePage = Math.min(totalPages - 1, currentPage + 1);

  if (firstMiddlePage > 2) {
    pageItems.push(ELLIPSIS);
  }

  for (let page = firstMiddlePage; page <= lastMiddlePage; page++) {
    pageItems.push(page);
  }

  if (lastMiddlePage < totalPages - 1) {
    pageItems.push(ELLIPSIS);
  }

  pageItems.push(totalPages);

  return pageItems;
};

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
  label = "Paginación",
  className = "",
}: PaginationProps) => (
  <nav
    className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    aria-label={label}
  >
    <button
      className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      aria-label="Página anterior"
    >
      ← Anterior
    </button>
    {getPageItems(page, totalPages).map((item, index) =>
      item === ELLIPSIS ? (
        <span
          key={`gap-${index}`}
          className="px-2 text-gray-400 select-none"
          aria-hidden="true"
        >
          {ELLIPSIS}
        </span>
      ) : (
        <PaginationButton
          key={item}
          page={item}
          currentPage={page}
          onPageChange={onPageChange}
        />
      ),
    )}
    <button
      className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      aria-label="Página siguiente"
    >
      Siguiente →
    </button>
  </nav>
);
