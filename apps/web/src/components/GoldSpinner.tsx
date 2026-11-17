export default function GoldSpinner({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="absolute inset-0 grid place-items-center">
      <span
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-card-gold-edge/25 border-t-card-gold-edge"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
