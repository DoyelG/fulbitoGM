export default function WidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-700">No pudimos cargar los datos.</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Reintentar
      </button>
    </div>
  )
}
