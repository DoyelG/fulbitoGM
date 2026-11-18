const ROWS = 10
const NUMERIC_COLUMNS = 8

const pulse = 'animate-pulse rounded bg-gray-200'
const rowGrid = 'grid items-center gap-x-4 px-4 sm:grid-cols-[minmax(12rem,2fr)_repeat(8,minmax(0,1fr))]'

function NumericCells({ height, width }: { height: string; width: string }) {
  return Array.from({ length: NUMERIC_COLUMNS }, (_, column) => (
    <div key={column} className={`hidden justify-self-end sm:block ${height} ${width} ${pulse}`} />
  ))
}

export default function StatisticsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando estadísticas…</span>
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className={`h-9 w-28 ${pulse}`} />
          <div className={`h-4 w-40 ${pulse}`} />
        </div>
        <div className={`${rowGrid} border-b border-gray-200 py-3.5`}>
          <div className={`h-3 w-16 ${pulse}`} />
          <NumericCells height="h-3" width="w-9" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: ROWS }, (_, row) => (
            <div key={row} className={`${rowGrid} py-2.5`}>
              <div className="flex items-center gap-3">
                <div className="size-6 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className={`h-4 w-28 ${pulse}`} />
              </div>
              <NumericCells height="h-4" width="w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
