export default function ScoreboardSkeleton() {
  return (
    <div>
      <span className="sr-only">Cargando el último partido…</span>
      <div aria-hidden className="mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
        <div className="mx-auto h-5 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-16 w-36 animate-pulse rounded-xl bg-white/10" />
        <div className="mx-auto h-5 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div aria-hidden className="mx-auto mt-4 h-4 w-56 animate-pulse rounded bg-white/10" />
    </div>
  )
}
