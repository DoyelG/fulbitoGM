import Spinner from "@/components/Spinner";

type InfiniteScrollSentinelProps = {
  sentinelRef: (node: HTMLElement | null) => void;
  label?: string;
  className?: string;
};

export const InfiniteScrollSentinel = ({
  sentinelRef,
  label = "Cargando más…",
  className = "",
}: InfiniteScrollSentinelProps) => (
  <Spinner ref={sentinelRef} label={label} className={`justify-center py-6 ${className}`} />
);
