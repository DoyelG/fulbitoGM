"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type PaginationMode = "responsive" | "pages" | "infinite";

export interface UsePaginationOptions {
  pageSize?: number;
  mode?: PaginationMode;
  mobileQuery?: string;
  resetKey?: unknown;
}

export interface UsePaginationResult<T> {
  items: T[];
  isInfinite: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  showPagination: boolean;
  hasMore: boolean;
  sentinelRef: (node: HTMLElement | null) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MOBILE_QUERY = "(max-width: 767px)";
export function usePagination<T>(
  allItems: T[],
  options: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    mode = "responsive",
    mobileQuery = DEFAULT_MOBILE_QUERY,
    resetKey,
  } = options;

  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const loadMoreRef = useRef<() => void>(() => {});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setPage(1);
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (mode !== "responsive") return;
    const mediaQuery = window.matchMedia(mobileQuery);
    const update = () => setIsMobileViewport(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [mode, mobileQuery]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const isInfinite =
    mode === "infinite" || (mode === "responsive" && isMobileViewport);

  const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const items = useMemo(() => {
    if (isInfinite) return allItems.slice(0, visibleCount);
    const start = (currentPage - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, isInfinite, visibleCount, currentPage, pageSize]);

  const hasMore = isInfinite && visibleCount < allItems.length;

  loadMoreRef.current = () =>
    setVisibleCount((prev) => Math.min(prev + pageSize, allItems.length));

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "200px" },
    );
    observerRef.current.observe(node);
  }, []);

  return {
    items,
    isInfinite,
    page: currentPage,
    totalPages,
    setPage,
    showPagination: !isInfinite && totalPages > 1,
    hasMore,
    sentinelRef,
  };
}
