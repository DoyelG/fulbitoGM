'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Pending = { kind: 'href'; href: string } | { kind: 'back' }

const SENTINEL_KEY = '__unsavedChangesGuard'

function internalHrefFrom(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  if (!(event.target instanceof Element)) return null
  const anchor = event.target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null
  return `${url.pathname}${url.search}${url.hash}`
}

function isOnSentinel(): boolean {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null && SENTINEL_KEY in state
}

function pushSentinel() {
  const state: unknown = window.history.state
  const base = typeof state === 'object' && state !== null ? state : {}
  window.history.pushState({ ...base, [SENTINEL_KEY]: true }, '', window.location.href)
}

export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter()
  const [pending, setPending] = useState<Pending | null>(null)
  const leavingRef = useRef(false)

  useEffect(() => {
    if (!isDirty) return
    leavingRef.current = false
    pushSentinel()
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const onClick = (event: MouseEvent) => {
      const href = internalHrefFrom(event)
      if (!href) return
      event.preventDefault()
      event.stopPropagation()
      setPending({ kind: 'href', href })
    }
    const onPopState = () => {
      if (leavingRef.current) return
      pushSentinel()
      setPending({ kind: 'back' })
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onClick, true)
      setTimeout(() => {
        if (!leavingRef.current && isOnSentinel()) window.history.back()
      }, 0)
    }
  }, [isDirty])

  const stay = useCallback(() => setPending(null), [])

  const leave = useCallback(() => {
    if (!pending) return
    leavingRef.current = true
    setPending(null)
    if (pending.kind === 'back') {
      window.history.go(-2)
      return
    }
    if (isOnSentinel()) router.replace(pending.href)
    else router.push(pending.href)
  }, [pending, router])

  return { isBlocking: pending !== null, stay, leave }
}
