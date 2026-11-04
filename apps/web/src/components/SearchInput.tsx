import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder, ariaLabel, className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}
