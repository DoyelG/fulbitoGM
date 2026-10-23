export default function WidgetSkeleton({ rows }: { rows: number }) {
  return (
    <div>
      <span className="sr-only">Cargando…</span>
      <div aria-hidden className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
