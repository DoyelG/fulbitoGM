'use client'

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  activeMention,
  insertMention,
  suggestMentions,
  type ActiveMention,
  type MentionCandidate,
} from '@fulbito/utils'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  candidates: MentionCandidate[]
  maxLength: number
  rows: number
  placeholder: string
  describedBy: string
  className: string
}

export default function MentionTextarea({
  id,
  value,
  onChange,
  candidates,
  maxLength,
  rows,
  placeholder,
  describedBy,
  className,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingCaret = useRef<number | null>(null)
  const [mention, setMention] = useState<ActiveMention | null>(null)
  const [highlighted, setHighlighted] = useState(0)
  const suggestions = useMemo(() => (mention ? suggestMentions(candidates, mention.query) : []), [candidates, mention])
  const isOpen = suggestions.length > 0
  const listId = `${id}-mentions`
  const activeIndex = Math.min(highlighted, suggestions.length - 1)

  useLayoutEffect(() => {
    const caret = pendingCaret.current
    if (caret === null || !textareaRef.current) return
    pendingCaret.current = null
    textareaRef.current.setSelectionRange(caret, caret)
  }, [value])

  const syncMention = (textarea: HTMLTextAreaElement) => {
    const next = activeMention(textarea.value, textarea.selectionStart ?? textarea.value.length)
    setMention((current) =>
      current?.start === next?.start && current?.end === next?.end && current?.query === next?.query ? current : next,
    )
    if (next?.query !== mention?.query) setHighlighted(0)
  }

  const choose = (candidate: MentionCandidate) => {
    if (!mention) return
    const next = insertMention(value, mention, candidate.handle)
    pendingCaret.current = next.caret
    setMention(null)
    onChange(next.text.slice(0, maxLength))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setHighlighted((activeIndex + step + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      const candidate = suggestions[activeIndex]
      if (!candidate) return
      event.preventDefault()
      choose(candidate)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setMention(null)
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          syncMention(event.target)
        }}
        onSelect={(event) => syncMention(event.currentTarget)}
        onKeyDown={handleKeyDown}
        onBlur={() => setMention(null)}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-autocomplete="list"
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        className={className}
      />
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Mencionar a"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        >
          {suggestions.map((candidate, index) => (
            <li
              key={candidate.handle}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault()
                choose(candidate)
              }}
              onMouseEnter={() => setHighlighted(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${
                index === activeIndex ? 'bg-primary/10 text-primary' : 'text-gray-900'
              }`}
            >
              <span className="truncate font-medium">{candidate.name}</span>
              <span className="shrink-0 text-xs text-gray-700">@{candidate.handle}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" aria-live="polite">
        {isOpen
          ? `${suggestions.length} ${suggestions.length === 1 ? 'sugerencia' : 'sugerencias'}. Usá las flechas y Enter para elegir.`
          : ''}
      </p>
    </div>
  )
}
