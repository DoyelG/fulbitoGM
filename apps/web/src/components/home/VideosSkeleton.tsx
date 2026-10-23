export default function VideosSkeleton() {
  return (
    <div>
      <span className="sr-only">Cargando videos…</span>
      <div aria-hidden className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-64 shrink-0 sm:w-72">
            <div className="aspect-video animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
