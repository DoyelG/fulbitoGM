import Chevron from '../shared/Icons/Chevron'

export type FilterOption<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  id: string
  label: string
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
}

export default function FilterSelect<T extends string>({ id, label, value, options, onChange }: Props<T>) {
  const isDefault = value === options[0]?.value

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={`h-9 w-full appearance-none rounded-md border pl-3 pr-9 text-sm font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isDefault ? 'border-gray-300 bg-white text-gray-700' : 'border-primary bg-primary/5 text-primary'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Chevron select />
      </div>
    </div>
  )
}
