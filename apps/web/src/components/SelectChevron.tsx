import { FiChevronDown } from 'react-icons/fi'

export default function SelectChevron() {
  return (
    <FiChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
    />
  )
}
