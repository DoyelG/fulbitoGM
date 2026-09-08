import { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

type Props = {
  text: string,
}

const PADDING = 5
const LINE_HEIGHT = 20 + PADDING

export function MatchDescription({ text }: Props) {
  const [isExpanded, setExpanded] = useState<boolean>(false)
  const [textHeight, setTextHeight] = useState(0)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.scrollHeight)
    }
  }, [])

  const isTruncatable = textHeight > LINE_HEIGHT

  return (
    <div className="mt-3 flex flex-wrap pb-4 items-start gap-3">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        disabled={!isTruncatable}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Contraer descripción' : 'Expandir descripción'}
        className="flex flex-1 min-w-0 items-start gap-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded disabled:cursor-default"
      >
        <p
          ref={textRef}
          className={`flex-1 min-w-0 text-sm font-light text-gray-700 break-words whitespace-pre-wrap ${
            isExpanded ? '' : 'line-clamp-1'
          }`}
        >
          {text}
        </p>
        {isTruncatable && (
          <FiChevronDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 cursor-pointer text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
    </div>
  )
}
