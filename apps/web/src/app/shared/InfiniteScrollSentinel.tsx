type InfiniteScrollSentinelProps = {
  /** Callback ref provisto por usePagination. */
  sentinelRef: (node: HTMLElement | null) => void;
  label?: string;
  className?: string;
};

export const InfiniteScrollSentinel = ({
  sentinelRef,
  label = "Cargando más…",
  className = "",
}: InfiniteScrollSentinelProps) => (
  <div
    ref={sentinelRef}
    className={`flex justify-center items-center gap-2 text-gray-600 py-6 ${className}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="animate-spin text-lg leading-none" aria-hidden="true">
      ⚽
    </span>
    {label}
  </div>
);
