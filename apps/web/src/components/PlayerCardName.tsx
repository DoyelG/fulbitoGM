'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { splitNameInTwoLines } from '@fulbito/utils'

export default function PlayerCardName({ name }: { name: string }) {
  const containerRef = useRef<HTMLParagraphElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [wraps, setWraps] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current || !measureRef.current) return
      setWraps(measureRef.current.offsetWidth > containerRef.current.clientWidth)
    }
    measure()
    void document.fonts.ready.then(measure)
  }, [name])

  const lines = wraps ? splitNameInTwoLines(name) : null

  return (
    <p
      ref={containerRef}
      className={`relative text-center font-bold ${wraps ? 'mt-1 line-clamp-2 text-xl leading-5 break-words' : 'mt-3 truncate text-2xl leading-8'}`}
    >
      <span ref={measureRef} aria-hidden className="invisible absolute whitespace-nowrap text-2xl leading-8">
        {name}
      </span>
      {lines ? (
        <>
          {lines[0]}
          <br />
          {lines[1]}
        </>
      ) : (
        name
      )}
    </p>
  )
}
