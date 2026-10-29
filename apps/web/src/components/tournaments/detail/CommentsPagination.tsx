import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const MAX_VISIBLE_PAGES = 7

const buttonClassName =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-md px-1.5 text-sm font-medium sm:h-8 sm:min-w-8 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed'

function visiblePages(current: number, total: number): (number | 'gap')[] {
  if (total <= MAX_VISIBLE_PAGES) return Array.from({ length: total }, (_, index) => index)
  const start = Math.max(1, Math.min(current - 1, total - 4))
  const end = Math.min(total - 2, Math.max(current + 1, 3))
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index)
  return [0, ...(start > 1 ? ['gap' as const] : []), ...middle, ...(end < total - 2 ? ['gap' as const] : []), total - 1]
}

export default function CommentsPagination({ page, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) return null

  return (
    <nav
      aria-label="Páginas de comentarios"
      className="mt-5 flex items-center justify-center gap-1 border-t border-gray-100 pt-3"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
        className={`${buttonClassName} text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent`}
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
      </button>
      {visiblePages(page, pageCount).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-gray-700" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Página ${item + 1}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${buttonClassName} ${
              item === page ? 'bg-brand text-white' : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {item + 1}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount - 1}
        aria-label="Página siguiente"
        className={`${buttonClassName} text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent`}
      >
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  )
}
