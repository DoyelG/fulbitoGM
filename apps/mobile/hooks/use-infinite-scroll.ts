import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 10

export type UseInfiniteScrollOptions = {
  pageSize?: number
  resetKey?: unknown
}

export type UseInfiniteScrollResult<T> = {
  visibleItems: T[]
  hasMore: boolean
  loadMore: () => void
}

export function useInfiniteScroll<T>(
  allItems: T[],
  options: UseInfiniteScrollOptions = {},
): UseInfiniteScrollResult<T> {
  const { pageSize = DEFAULT_PAGE_SIZE, resetKey } = options

  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [resetKey, pageSize])

  const visibleItems = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount],
  )

  const hasMore = visibleCount < allItems.length

  const loadMore = useCallback(() => {
    if (visibleCount >= allItems.length) return
    setVisibleCount((prev) => Math.min(prev + pageSize, allItems.length))
  }, [visibleCount, allItems.length, pageSize])

  return { visibleItems, hasMore, loadMore }
}
