export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid gap-4">
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-gray-200 border-t-brand rounded-full animate-spin" />
      </div>
    </div>
  )
}


