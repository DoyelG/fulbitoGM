# Player Video Clips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Clips" section to the player detail page (web and mobile) where admins can upload video clips (goals, highlights, bloopers) tied to a match and one or more players, and anyone can browse/play them back.

**Architecture:** New `videoClips` Firestore collection + Storage path, a shared `VideoClip` type and category constants in `packages/types`, centralized upload/CRUD helpers in `packages/firebase` (new code — this is the one place we don't replicate the existing web/mobile duplication of inline Firestore/Storage calls), a Zustand store on web and a plain data hook on mobile (matching each platform's existing convention), and new UI: a filterable card grid, an upload modal/screen, and a playback modal/screen — gated by `isAdmin`.

**Tech Stack:** Next.js 15 (App Router) + Tailwind v4 + Zustand v5 on web; Expo 54 + React Native 0.81 + Expo Router on mobile; Firebase Firestore/Storage on both; `expo-video` (new dependency) for mobile playback.

**Spec:** `docs/superpowers/specs/2026-08-12-player-video-clips-design.md`

## Global Constraints

- TypeScript strict mode, never `any` (use `unknown` if truly unknown).
- pnpm only — never `npm`/`yarn`. Run installs from the relevant app/package directory or with `pnpm --filter`.
- File naming: kebab-case for hooks/utilities, PascalCase for components. Named exports for types/utilities, default exports for components/screens.
- Path aliases: `@/` in both apps, `@fulbito/types`, `@fulbito/utils`, `@fulbito/firebase`.
- No unused imports. No `console.log`. No `// eslint-disable` or `@ts-ignore`/`@ts-expect-error` — fix the underlying issue instead.
- Prettier: `singleQuote`, no `semi`, `trailingComma: all`, `printWidth: 120`, `tabWidth: 2`.
- Web accessibility: every interactive element is a `button`/`a`/keyboard-reachable element with visible focus styles; images need `alt`; form inputs need associated `<label>`.
- Mobile accessibility: every touchable needs `accessibilityLabel` and `accessibilityRole`; minimum 44×44 touch targets.
- Mobile styles: `StyleSheet.create()` in a separate `*.styles.ts` file next to the component — this plan follows that convention for new files even though the existing `components/players/detail/*` files (written before this rule was written down) keep styles inline.
- **No test framework exists anywhere in this repo** (confirmed: zero `*.test.*`/`*.spec.*` files, no Jest/Vitest config). This plan does **not** introduce one. Each task's verification step is `tsc --noEmit` plus a manual check (dev server in browser / Expo Go or simulator), consistent with how the rest of the codebase is verified today.
- No file size limit and no file format/MIME restriction on video uploads — explicit product decision, not an oversight.
- Upload and delete are gated by `isAdmin` (web: `useFirebaseAuth().isAdmin`; mobile: `useIsAdmin()`), matching the existing player-photo gating.
- Storage path convention for clips: `videoClips/{clipId}` (no extension — `contentType` is inferred from the `File`/`Blob`, same implicit behavior as player photos).

---

### Task 1: `VideoClip` type and category constants (`packages/types`)

**Files:**
- Create: `packages/types/src/video-clip.ts`
- Modify: `packages/types/src/index.ts`

**Interfaces:**
- Produces: `VideoClipCategory` (`'goal' | 'blooper' | 'highlight' | 'other'`), `VideoClip` type, `VIDEO_CLIP_CATEGORIES` constant — consumed by every later task in both apps.

- [ ] **Step 1: Create the type file**

```ts
// packages/types/src/video-clip.ts
export type VideoClipCategory = 'goal' | 'blooper' | 'highlight' | 'other'

export type VideoClip = {
  id: string
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
  url: string
  createdAt: Date
  updatedAt: Date
}

export type VideoClipCategoryMeta = {
  value: VideoClipCategory
  label: string
  icon: string
}

export const VIDEO_CLIP_CATEGORIES: VideoClipCategoryMeta[] = [
  { value: 'goal', label: 'Gol', icon: '⚽' },
  { value: 'highlight', label: 'Highlight', icon: '🌟' },
  { value: 'blooper', label: 'Blooper', icon: '🤦' },
  { value: 'other', label: 'Otro', icon: '🎬' },
]
```

- [ ] **Step 2: Export it from the package index**

In `packages/types/src/index.ts`, add:

```ts
export * from './video-clip'
```

(alongside the existing `common`, `player`, `match`, `team` exports).

- [ ] **Step 3: Verify**

Run: `pnpm --filter @fulbito/types exec tsc --noEmit -p .` (or, if there's no local `tsconfig.json`, run `pnpm -w exec tsc --noEmit packages/types/src/video-clip.ts --strict --esModuleInterop --skipLibCheck` as a quick syntax check).
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/types/src/video-clip.ts packages/types/src/index.ts
git commit -m "feat(types): add VideoClip type and category constants"
```

---

### Task 2: Firebase helpers + Firestore/Storage rules (`packages/firebase`, root rules files)

**Files:**
- Create: `packages/firebase/src/video-clips.ts`
- Modify: `packages/firebase/src/index.ts`
- Modify: `firestore.rules`
- Modify: `storage.rules`

**Interfaces:**
- Consumes: `VideoClip` from `@fulbito/types` (Task 1).
- Produces: `uploadVideoClip(file, clipId): Promise<string>`, `createVideoClip(id, data): Promise<void>`, `getVideoClips(): Promise<VideoClip[]>`, `deleteVideoClip(id): Promise<void>` — consumed by the web store (Task 3) and the mobile hook (Task 8).

- [ ] **Step 1: Create the helper file**

```ts
// packages/firebase/src/video-clips.ts
import {
  getFirestore, collection, doc,
  getDocs, setDoc, deleteDoc, Timestamp,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import type { VideoClip } from '@fulbito/types'

function docToVideoClip(id: string, data: Record<string, any>): VideoClip {
  return {
    id,
    matchId: data.matchId,
    playerIds: data.playerIds ?? [],
    category: data.category,
    title: data.title ?? undefined,
    url: data.url,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

export async function uploadVideoClip(file: File | Blob, clipId: string): Promise<string> {
  const storage = getStorage()
  const storageRef = ref(storage, `videoClips/${clipId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteVideoClipFile(clipId: string): Promise<void> {
  const storage = getStorage()
  const storageRef = ref(storage, `videoClips/${clipId}`)
  try {
    await deleteObject(storageRef)
  } catch {
    // ignore if file doesn't exist
  }
}

export async function createVideoClip(
  id: string,
  data: Omit<VideoClip, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const db = getFirestore()
  await setDoc(doc(db, 'videoClips', id), {
    matchId: data.matchId,
    playerIds: data.playerIds,
    category: data.category,
    title: data.title ?? null,
    url: data.url,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function getVideoClips(): Promise<VideoClip[]> {
  const db = getFirestore()
  const snap = await getDocs(collection(db, 'videoClips'))
  return snap.docs.map(d => docToVideoClip(d.id, d.data()))
}

export async function deleteVideoClip(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'videoClips', id))
  await deleteVideoClipFile(id)
}
```

- [ ] **Step 2: Export it from the package index**

In `packages/firebase/src/index.ts`, add:

```ts
export * from './video-clips'
```

- [ ] **Step 3: Add Firestore rules for `videoClips`**

In `firestore.rules`, inside `service cloud.firestore { match /databases/{database}/documents { ... } }`, add a new rule block next to the existing `matches`/`matchPlayers` ones:

```
    match /videoClips/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
```

- [ ] **Step 4: Add Storage rules for `videoClips`**

In `storage.rules`, inside `service firebase.storage { match /b/{bucket}/o { ... } }`, add:

```
    // Video clips: anyone may view; only signed-in users may upload.
    match /videoClips/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
```

- [ ] **Step 5: Verify**

Run: `pnpm --filter @fulbito/firebase exec tsc --noEmit -p . 2>&1 || true` — if the package has no standalone `tsconfig.json`, instead verify by building the web app in the next task (its typecheck will surface any error in this file, since it imports it).
Run: `firebase deploy --only firestore:rules,storage --dry-run` if the Firebase CLI is configured locally, to confirm the rules files parse. If not available, visually re-check the two rule blocks match the existing `players`/`matchPlayers` pattern exactly (same `allow read/write` shape).

- [ ] **Step 6: Commit**

```bash
git add packages/firebase/src/video-clips.ts packages/firebase/src/index.ts firestore.rules storage.rules
git commit -m "feat(firebase): add video clip upload/CRUD helpers and security rules"
```

**Note:** these rules aren't live until deployed — flag to the user at the end of the plan that `firebase deploy --only firestore:rules,storage` needs to run against the real project before uploads will work in production (this is a deploy action, not something to run automatically).

---

### Task 3: Web store — `useVideoClipStore`

**Files:**
- Create: `apps/web/src/store/useVideoClipStore.ts`

**Interfaces:**
- Consumes: `VideoClip`, `VideoClipCategory` from `@fulbito/types`; `uploadVideoClip`, `createVideoClip`, `getVideoClips`, `deleteVideoClip` from `@fulbito/firebase` (Task 2).
- Produces: `useVideoClipStore` hook with state `videoClips: VideoClip[]`, `videoClipsInit: 'idle' | 'loading' | 'loaded' | 'error'`, and actions `initLoad()`, `addVideoClip(data, file)`, `deleteVideoClip(id)` — consumed by `VideoClipsSection` (Task 7).

- [ ] **Step 1: Create the store**

```ts
// apps/web/src/store/useVideoClipStore.ts
import { create } from 'zustand'
import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import {
  uploadVideoClip,
  createVideoClip,
  getVideoClips,
  deleteVideoClip as deleteVideoClipRemote,
} from '@fulbito/firebase'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

type VideoClipStore = {
  videoClips: VideoClip[]
  videoClipsInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, file: File) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
  resetAndReload: () => Promise<void>
}

export const useVideoClipStore = create<VideoClipStore>()((set, get) => ({
  videoClips: [],
  videoClipsInit: 'idle',
  initLoad: async () => {
    const state = get().videoClipsInit
    if (state === 'loading' || state === 'loaded') return
    set({ videoClipsInit: 'loading' })
    try {
      const data = await getVideoClips()
      set({ videoClips: data, videoClipsInit: 'loaded' })
    } catch {
      set({ videoClipsInit: 'error' })
    }
  },
  addVideoClip: async (data, file) => {
    const id = crypto.randomUUID()
    const url = await uploadVideoClip(file, id)
    await createVideoClip(id, { ...data, url })
    await get().resetAndReload()
  },
  deleteVideoClip: async (id) => {
    await deleteVideoClipRemote(id)
    set(s => ({ videoClips: s.videoClips.filter(c => c.id !== id) }))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await getVideoClips()
    set({ videoClips: data, videoClipsInit: 'loaded' })
  },
}))
```

- [ ] **Step 2: Verify**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: no errors (this file has no consumers yet, but must typecheck standalone).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/store/useVideoClipStore.ts
git commit -m "feat(web): add useVideoClipStore for video clip CRUD"
```

---

### Task 4: Web — generic `Modal` component

**Files:**
- Create: `apps/web/src/components/Modal.tsx`

**Interfaces:**
- Produces: `<Modal open title onClose>{children}</Modal>` — consumed by `VideoClipsSection` (Task 7) for both the upload and playback dialogs.

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/components/Modal.tsx
'use client'

import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-brand rounded"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Modal.tsx
git commit -m "feat(web): add generic Modal component"
```

---

### Task 5: Web — `VideoClipCard` component

**Files:**
- Create: `apps/web/src/components/videoClips/VideoClipCard.tsx`

**Interfaces:**
- Consumes: `VideoClip`, `Match`, `VIDEO_CLIP_CATEGORIES` from `@fulbito/types` (Task 1).
- Produces: `<VideoClipCard clip match isAdmin onOpen onDelete />` — consumed by `VideoClipsSection` (Task 7).

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/components/videoClips/VideoClipCard.tsx
'use client'

import type { Match, VideoClip } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'

type Props = {
  clip: VideoClip
  match: Match | undefined
  isAdmin: boolean
  onOpen: () => void
  onDelete: () => void
}

export default function VideoClipCard({ clip, match, isAdmin, onOpen, onDelete }: Props) {
  const meta = VIDEO_CLIP_CATEGORIES.find(c => c.value === clip.category)
  const label = clip.title || meta?.label || 'Clip'

  return (
    <div className="relative rounded-lg border bg-gray-50">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        aria-label={`Ver clip: ${label}`}
      >
        <div className="flex items-center justify-center h-20 text-3xl" aria-hidden="true">
          {meta?.icon ?? '🎬'}
        </div>
        <div className="px-2 pb-2 text-center">
          <div className="text-xs font-medium truncate">{label}</div>
          {match && (
            <div className="text-[10px] text-gray-700">
              {new Date(match.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar clip: ${label}`}
          className="absolute top-1 right-1 z-10 text-xs bg-white/90 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          🗑
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/videoClips/VideoClipCard.tsx
git commit -m "feat(web): add VideoClipCard component"
```

---

### Task 6: Web — `VideoClipUploadForm` component

**Files:**
- Create: `apps/web/src/components/videoClips/VideoClipUploadForm.tsx`

**Interfaces:**
- Consumes: `Match`, `VideoClipCategory`, `VIDEO_CLIP_CATEGORIES` from `@fulbito/types`; `NewVideoClipData` type shape from Task 3 (matched inline, not imported, to keep this component decoupled from the store).
- Produces: `<VideoClipUploadForm matches currentPlayerId onSubmit onCancel />` where `onSubmit: (data: { matchId, playerIds, category, title? }, file: File) => Promise<void>` — consumed by `VideoClipsSection` (Task 7).

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/components/videoClips/VideoClipUploadForm.tsx
'use client'

import { useMemo, useState } from 'react'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'

type UploadData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

type Props = {
  matches: Match[]
  currentPlayerId: string
  onSubmit: (data: UploadData, file: File) => Promise<void>
  onCancel: () => void
}

export default function VideoClipUploadForm({ matches, currentPlayerId, onSubmit, onCancel }: Props) {
  const [matchId, setMatchId] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [category, setCategory] = useState<VideoClipCategory>('highlight')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedMatch = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId])
  const suggestedPlayers = useMemo(
    () => (selectedMatch ? [...selectedMatch.teamA, ...selectedMatch.teamB] : []),
    [selectedMatch],
  )

  const handleMatchChange = (id: string) => {
    setMatchId(id)
    setPlayerIds(id ? [currentPlayerId] : [])
  }

  const togglePlayer = (id: string) => {
    setPlayerIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  const canSubmit = matchId !== '' && playerIds.length > 0 && file !== null && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !file) return
    setSubmitting(true)
    try {
      await onSubmit({ matchId, playerIds, category, title: title.trim() || undefined }, file)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="clip-match" className="block text-sm font-medium text-black">
          Partido
        </label>
        <select
          id="clip-match"
          required
          value={matchId}
          onChange={e => handleMatchChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          <option value="">Elegí un partido</option>
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {new Date(m.date).toLocaleDateString()} · {m.type}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <div>
          <span className="block text-sm font-medium text-black">Jugadores en el clip</span>
          <div className="mt-1 grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border rounded-md p-2">
            {suggestedPlayers.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={playerIds.includes(p.id)}
                  onChange={() => togglePlayer(p.id)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="clip-category" className="block text-sm font-medium text-black">
          Categoría
        </label>
        <select
          id="clip-category"
          value={category}
          onChange={e => setCategory(e.target.value as VideoClipCategory)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          {VIDEO_CLIP_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="clip-title" className="block text-sm font-medium text-black">
          Título (opcional)
        </label>
        <input
          id="clip-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="clip-file" className="block text-sm font-medium text-black">
          Archivo de video
        </label>
        <input
          id="clip-file"
          type="file"
          required
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 disabled:opacity-50"
        >
          {submitting ? 'Subiendo...' : 'Subir clip'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verify**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/videoClips/VideoClipUploadForm.tsx
git commit -m "feat(web): add VideoClipUploadForm component"
```

---

### Task 7: Web — `VideoClipsSection` and player page integration

**Files:**
- Create: `apps/web/src/components/videoClips/VideoClipsSection.tsx`
- Modify: `apps/web/src/app/players/[id]/page.tsx`

**Interfaces:**
- Consumes: `useVideoClipStore` (Task 3), `Modal` (Task 4), `VideoClipCard` (Task 5), `VideoClipUploadForm` (Task 6), `VIDEO_CLIP_CATEGORIES`/`VideoClipCategory` (Task 1), `Player`/`Match` from `@fulbito/types`.
- Produces: `<VideoClipsSection player matches isAdmin />` rendered on the player detail page, after the "Partidos recientes" card.

- [ ] **Step 1: Create the section component**

```tsx
// apps/web/src/components/videoClips/VideoClipsSection.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, Player, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { useVideoClipStore, type NewVideoClipData } from '@/store/useVideoClipStore'
import Modal from '@/components/Modal'
import VideoClipCard from '@/components/videoClips/VideoClipCard'
import VideoClipUploadForm from '@/components/videoClips/VideoClipUploadForm'

type Props = {
  player: Player
  matches: Match[]
  isAdmin: boolean
}

export default function VideoClipsSection({ player, matches, isAdmin }: Props) {
  const videoClips = useVideoClipStore(s => s.videoClips)
  const videoClipsInit = useVideoClipStore(s => s.videoClipsInit)
  const initLoad = useVideoClipStore(s => s.initLoad)
  const addVideoClip = useVideoClipStore(s => s.addVideoClip)
  const deleteVideoClip = useVideoClipStore(s => s.deleteVideoClip)

  const [filter, setFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playbackClipId, setPlaybackClipId] = useState<string | null>(null)

  useEffect(() => {
    if (videoClipsInit !== 'loaded') initLoad()
  }, [videoClipsInit, initLoad])

  const playerClips = useMemo(
    () => videoClips.filter(c => c.playerIds.includes(player.id)),
    [videoClips, player.id],
  )
  const filteredClips = useMemo(
    () => (filter === 'all' ? playerClips : playerClips.filter(c => c.category === filter)),
    [playerClips, filter],
  )
  const matchById = useMemo(() => new Map(matches.map(m => [m.id, m])), [matches])
  const playbackClip = playbackClipId ? (playerClips.find(c => c.id === playbackClipId) ?? null) : null

  const handleUpload = async (data: NewVideoClipData, file: File) => {
    await addVideoClip(data, file)
    setUploadOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este clip?')) return
    await deleteVideoClip(id)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clips</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-3 py-1.5 rounded bg-brand text-white text-sm hover:bg-brand/90"
          >
            + Subir clip
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Filtrar por categoría">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm border ${
              filter === 'all' ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {VIDEO_CLIP_CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={filter === c.value}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1 rounded text-sm border ${
                filter === c.value ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {filteredClips.length === 0 ? (
          <div className="text-gray-800">No hay clips para este jugador todavía.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredClips.map(clip => (
              <VideoClipCard
                key={clip.id}
                clip={clip}
                match={matchById.get(clip.matchId)}
                isAdmin={isAdmin}
                onOpen={() => setPlaybackClipId(clip.id)}
                onDelete={() => handleDelete(clip.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir clip">
        <VideoClipUploadForm
          matches={matches}
          currentPlayerId={player.id}
          onSubmit={handleUpload}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>

      <Modal open={playbackClip !== null} onClose={() => setPlaybackClipId(null)} title={playbackClip?.title || 'Clip'}>
        {playbackClip && (
          <video controls autoPlay className="w-full rounded" src={playbackClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Integrate into the player detail page**

In `apps/web/src/app/players/[id]/page.tsx`:

Add the import near the other component imports (after the `PlayerCard` import at line 13):

```ts
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
```

Add the section right after the "Partidos recientes" card's closing `</div>` (the outer card `<div className="bg-white rounded-lg shadow">` that starts around line 476), just before the page's final closing `</div>` (line 522):

```tsx
      <div className="mt-6">
        <VideoClipsSection player={player} matches={matches} isAdmin={isAdmin} />
      </div>
```

`player`, `matches`, and `isAdmin` are already in scope in this component (lines 43, 27, 21 respectively).

- [ ] **Step 3: Verify — typecheck**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify — manual browser check**

Run: `pnpm --filter @fulbito/web dev`, sign in as an admin user, open any player's detail page (`/players/[id]`).
Check:
- "Clips" card renders after "Partidos recientes", empty state shows "No hay clips para este jugador todavía."
- "+ Subir clip" button is visible (admin) and opens the upload modal.
- Selecting a match shows that match's players as checkboxes, with the current player pre-checked.
- Submitting with a small video file succeeds, the modal closes, and the new clip's icon card appears in the grid under the right category tab.
- Clicking a card opens the playback modal and the video plays.
- Delete icon removes the clip after confirming the browser `confirm()` dialog.
- Sign out (or check as a non-admin user): "+ Subir clip" and delete icons are hidden, but clips are still visible and playable.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/videoClips/VideoClipsSection.tsx apps/web/src/app/players/[id]/page.tsx
git commit -m "feat(web): add video clips section to player detail page"
```

---

### Task 8: Mobile — add `expo-video` and `use-video-clips-data` hook

**Files:**
- Modify: `apps/mobile/package.json` (via `npx expo install`, not a hand edit)
- Create: `apps/mobile/hooks/use-video-clips-data.ts`

**Interfaces:**
- Consumes: `VideoClip`, `VideoClipCategory` from `@fulbito/types`; `uploadVideoClip`, `createVideoClip`, `getVideoClips`, `deleteVideoClip` from `@fulbito/firebase` (Task 2).
- Produces: `useVideoClipsData()` hook returning `{ videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }` — consumed by the player detail screen (Task 11).

- [ ] **Step 1: Install `expo-video`**

Run (from `apps/mobile`): `npx expo install expo-video`

This resolves the correct version for the installed Expo SDK (54) automatically — do not hand-pick a version.

- [ ] **Step 2: Create the hook**

```ts
// apps/mobile/hooks/use-video-clips-data.ts
import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import { createVideoClip, deleteVideoClip as deleteVideoClipRemote, getVideoClips, uploadVideoClip } from '@fulbito/firebase'
import { useCallback, useEffect, useState } from 'react'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

export type VideoClipsDataState = {
  videoClips: VideoClip[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, fileUri: string) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
}

export function useVideoClipsData(): VideoClipsDataState {
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setVideoClips(await getVideoClips())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los clips')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const addVideoClip = useCallback(async (data: NewVideoClipData, fileUri: string) => {
    const id = crypto.randomUUID()
    const response = await fetch(fileUri)
    const blob = await response.blob()
    const url = await uploadVideoClip(blob, id)
    await createVideoClip(id, { ...data, url })
    await reload()
  }, [reload])

  const deleteVideoClip = useCallback(async (id: string) => {
    await deleteVideoClipRemote(id)
    setVideoClips(prev => prev.filter(c => c.id !== id))
    await reload()
  }, [reload])

  useEffect(() => { void reload() }, [reload])

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
```

- [ ] **Step 3: Verify**

Run (from `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/pnpm-lock.yaml apps/mobile/hooks/use-video-clips-data.ts
git commit -m "feat(mobile): add expo-video dependency and use-video-clips-data hook"
```

(If the lockfile is shared at the repo root instead of per-app, `git add pnpm-lock.yaml` there instead — check with `git status` before committing.)

---

### Task 9: Mobile — `VideoClipCard` component

**Files:**
- Create: `apps/mobile/components/players/detail/video-clip-card.tsx`
- Create: `apps/mobile/components/players/detail/video-clip-card.styles.ts`

**Interfaces:**
- Consumes: `VideoClip`, `Match`, `VIDEO_CLIP_CATEGORIES` from `@fulbito/types`; `useAppTheme` from `@/hooks/use-theme`; `Fonts`, `Radii`, `Spacing` from `@/constants/theme`.
- Produces: `<VideoClipCard clip match isAdmin onOpen onDelete />` — consumed by the player detail screen (Task 11).

- [ ] **Step 1: Create the styles file**

```ts
// apps/mobile/components/players/detail/video-clip-card.styles.ts
import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  pressable: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  date: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
```

- [ ] **Step 2: Create the component**

```tsx
// apps/mobile/components/players/detail/video-clip-card.tsx
import type { Match, VideoClip } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Pressable, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './video-clip-card.styles'

type Props = {
  clip: VideoClip
  match: Match | undefined
  isAdmin: boolean
  onOpen: () => void
  onDelete: () => void
}

export function VideoClipCard({ clip, match, isAdmin, onOpen, onDelete }: Props) {
  const { colors } = useAppTheme()
  const meta = VIDEO_CLIP_CATEGORIES.find(c => c.value === clip.category)
  const label = clip.title || meta?.label || 'Clip'

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={onOpen}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`Ver clip: ${label}`}>
        <ThemedText style={styles.icon}>{meta?.icon ?? '🎬'}</ThemedText>
        <ThemedText style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </ThemedText>
        {match && (
          <ThemedText style={[styles.date, { color: colors.muted }]}>
            {new Date(match.date).toLocaleDateString()}
          </ThemedText>
        )}
      </Pressable>
      {isAdmin && (
        <Pressable
          onPress={onDelete}
          style={[styles.deleteBtn, { backgroundColor: colors.background }]}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar clip: ${label}`}>
          <MaterialIcons name="delete" size={16} color={colors.danger} />
        </Pressable>
      )}
    </View>
  )
}
```

- [ ] **Step 3: Verify**

Run (from `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/components/players/detail/video-clip-card.tsx apps/mobile/components/players/detail/video-clip-card.styles.ts
git commit -m "feat(mobile): add VideoClipCard component"
```

---

### Task 10: Mobile — video clip upload modal

**Files:**
- Create: `apps/mobile/components/players/detail/video-clip-upload-modal.tsx`
- Create: `apps/mobile/components/players/detail/video-clip-upload-modal.styles.ts`

**Interfaces:**
- Consumes: `Match`, `VideoClipCategory`, `VIDEO_CLIP_CATEGORIES` from `@fulbito/types`; `NewVideoClipData` shape from Task 8 (matched inline).
- Produces: `<VideoClipUploadModal visible matches currentPlayerId onSubmit onClose />` where `onSubmit: (data, fileUri: string) => Promise<void>` — consumed by the player detail screen (Task 11).

- [ ] **Step 1: Create the styles file**

```ts
// apps/mobile/components/players/detail/video-clip-upload-modal.styles.ts
import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    marginBottom: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    minHeight: 44,
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    minHeight: 44,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    fontFamily: Fonts.regular,
    minHeight: 44,
  },
  pickBtn: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  submitBtn: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
})
```

- [ ] **Step 2: Create the component**

```tsx
// apps/mobile/components/players/detail/video-clip-upload-modal.tsx
import * as ImagePicker from 'expo-image-picker'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './video-clip-upload-modal.styles'

type UploadData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

type Props = {
  visible: boolean
  matches: Match[]
  currentPlayerId: string
  onSubmit: (data: UploadData, fileUri: string) => Promise<void>
  onClose: () => void
}

export function VideoClipUploadModal({ visible, matches, currentPlayerId, onSubmit, onClose }: Props) {
  const { colors } = useAppTheme()
  const [matchId, setMatchId] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [category, setCategory] = useState<VideoClipCategory>('highlight')
  const [title, setTitle] = useState('')
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedMatch = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId])
  const suggestedPlayers = useMemo(
    () => (selectedMatch ? [...selectedMatch.teamA, ...selectedMatch.teamB] : []),
    [selectedMatch],
  )

  const selectMatch = (id: string) => {
    setMatchId(id)
    setPlayerIds(id ? [currentPlayerId] : [])
  }

  const togglePlayer = (id: string) => {
    setPlayerIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  const pickVideo = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus videos para elegir un archivo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] })
    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri)
    }
  }

  const reset = () => {
    setMatchId('')
    setPlayerIds([])
    setCategory('highlight')
    setTitle('')
    setVideoUri(null)
  }

  const canSubmit = matchId !== '' && playerIds.length > 0 && videoUri !== null && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !videoUri) return
    setSubmitting(true)
    try {
      await onSubmit({ matchId, playerIds, category, title: title.trim() || undefined }, videoUri)
      reset()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir el clip.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>Subir clip</ThemedText>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Cerrar">
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Partido</ThemedText>
            {matches.map(m => (
              <Pressable
                key={m.id}
                onPress={() => selectMatch(m.id)}
                style={[
                  styles.optionRow,
                  { borderColor: matchId === m.id ? colors.brand : colors.border },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Partido ${new Date(m.date).toLocaleDateString()} ${m.type}`}
                accessibilityState={{ selected: matchId === m.id }}>
                <ThemedText style={[styles.optionText, { color: colors.text }]}>
                  {new Date(m.date).toLocaleDateString()} · {m.type}
                </ThemedText>
                {matchId === m.id && <MaterialIcons name="check" size={18} color={colors.brand} />}
              </Pressable>
            ))}
          </View>

          {selectedMatch && (
            <View>
              <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Jugadores en el clip</ThemedText>
              {suggestedPlayers.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => togglePlayer(p.id)}
                  style={styles.playerRow}
                  accessibilityRole="checkbox"
                  accessibilityLabel={p.name}
                  accessibilityState={{ checked: playerIds.includes(p.id) }}>
                  <MaterialIcons
                    name={playerIds.includes(p.id) ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={playerIds.includes(p.id) ? colors.brand : colors.muted}
                  />
                  <ThemedText style={{ color: colors.text }}>{p.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Categoría</ThemedText>
            <View style={styles.categoryRow}>
              {VIDEO_CLIP_CATEGORIES.map(c => (
                <Pressable
                  key={c.value}
                  onPress={() => setCategory(c.value)}
                  style={[
                    styles.categoryChip,
                    { borderColor: category === c.value ? colors.brand : colors.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={c.label}
                  accessibilityState={{ selected: category === c.value }}>
                  <ThemedText>{c.icon}</ThemedText>
                  <ThemedText style={{ color: colors.text }}>{c.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Título (opcional)</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholderTextColor={colors.muted}
            />
          </View>

          <Pressable
            onPress={pickVideo}
            style={[styles.pickBtn, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={videoUri ? 'Video seleccionado, elegir otro' : 'Elegir video'}>
            <ThemedText style={{ color: colors.text }}>
              {videoUri ? 'Video seleccionado ✓ (tocá para cambiar)' : 'Elegir video'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, { backgroundColor: colors.brand, opacity: canSubmit ? 1 : 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Subir clip"
            accessibilityState={{ disabled: !canSubmit, busy: submitting }}>
            <ThemedText style={styles.submitText}>{submitting ? 'Subiendo...' : 'Subir clip'}</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}
```

- [ ] **Step 3: Verify**

Run (from `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/components/players/detail/video-clip-upload-modal.tsx apps/mobile/components/players/detail/video-clip-upload-modal.styles.ts
git commit -m "feat(mobile): add video clip upload modal"
```

---

### Task 11: Mobile — integrate clips section + playback into player detail screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/players/[id].tsx`

**Interfaces:**
- Consumes: `useVideoClipsData` (Task 8), `VideoClipCard` (Task 9), `VideoClipUploadModal` (Task 10), `VIDEO_CLIP_CATEGORIES`/`VideoClipCategory` from `@fulbito/types`, `useIsAdmin` (existing), `expo-video`'s `useVideoPlayer`/`VideoView` (Task 8 dependency).

- [ ] **Step 1: Add state, data, and handlers to the screen**

In `apps/mobile/app/(tabs)/players/[id].tsx`, add imports (near the existing ones):

```ts
import { useMemo, useState } from 'react'
import { Alert, Modal as RNModal } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import type { VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { VideoClipCard } from '@/components/players/detail/video-clip-card'
import { VideoClipUploadModal } from '@/components/players/detail/video-clip-upload-modal'
import { useVideoClipsData } from '@/hooks/use-video-clips-data'
import { useMatchesData } from '@/hooks/use-matches-data'
```

(`useMemo`/`useState` merge into the existing `react` import at line 3. `useMatchesData()` — confirmed in `apps/mobile/hooks/use-matches-data.ts` — returns `{ matches, players, loading, refreshing, error, reload, refresh, deleteMatch, addMatch, updateMatch }`; we only need `matches` here, since `usePlayerDetail` only exposes filtered/derived stats, not the raw list needed for the upload form's match picker.)

Inside `PlayerDetailScreen`, after the `usePlayerDetail(id)` call:

```ts
  const isAdminUser = isAdmin // already computed above via useIsAdmin()
  const { matches: allMatches } = useMatchesData()
  const { videoClips, addVideoClip, deleteVideoClip } = useVideoClipsData()
  const [clipFilter, setClipFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadVisible, setUploadVisible] = useState(false)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)

  const playerClips = useMemo(
    () => videoClips.filter(c => c.playerIds.includes(id)),
    [videoClips, id],
  )
  const filteredClips = useMemo(
    () => (clipFilter === 'all' ? playerClips : playerClips.filter(c => c.category === clipFilter)),
    [playerClips, clipFilter],
  )
  const matchById = useMemo(() => new Map(allMatches.map(m => [m.id, m])), [allMatches])

  const player = useVideoPlayer(playbackUrl ?? '', p => { p.loop = false })

  const handleDeleteClip = (clipId: string, label: string) => {
    Alert.alert('Eliminar clip', `¿Eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void deleteVideoClip(clipId) },
    ])
  }
```

- [ ] **Step 2: Render the clips section**

After the "Últimos partidos" block (right before `<View style={styles.bottomPad} />`), add:

```tsx
          <SectionTitle title="Clips" />
          <View style={styles.clipFilterRow}>
            <Pressable
              onPress={() => setClipFilter('all')}
              style={[styles.clipFilterChip, { borderColor: clipFilter === 'all' ? colors.brand : colors.border }]}
              accessibilityRole="button"
              accessibilityLabel="Todos los clips"
              accessibilityState={{ selected: clipFilter === 'all' }}>
              <ThemedText style={{ color: colors.text }}>Todos</ThemedText>
            </Pressable>
            {VIDEO_CLIP_CATEGORIES.map(c => (
              <Pressable
                key={c.value}
                onPress={() => setClipFilter(c.value)}
                style={[styles.clipFilterChip, { borderColor: clipFilter === c.value ? colors.brand : colors.border }]}
                accessibilityRole="button"
                accessibilityLabel={c.label}
                accessibilityState={{ selected: clipFilter === c.value }}>
                <ThemedText style={{ color: colors.text }}>{c.icon} {c.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {isAdminUser && (
            <Pressable
              onPress={() => setUploadVisible(true)}
              style={[styles.uploadClipBtn, { backgroundColor: colors.brand }]}
              accessibilityRole="button"
              accessibilityLabel="Subir clip">
              <ThemedText style={styles.uploadClipBtnText}>+ Subir clip</ThemedText>
            </Pressable>
          )}

          {filteredClips.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="movie" size={32} color={colors.muted} />
              <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
                Sin clips para este jugador
              </ThemedText>
            </View>
          ) : (
            <View style={styles.clipsGrid}>
              {filteredClips.map(clip => (
                <VideoClipCard
                  key={clip.id}
                  clip={clip}
                  match={matchById.get(clip.matchId)}
                  isAdmin={isAdminUser}
                  onOpen={() => setPlaybackUrl(clip.url)}
                  onDelete={() => handleDeleteClip(clip.id, clip.title || 'clip')}
                />
              ))}
            </View>
          )}

          <VideoClipUploadModal
            visible={uploadVisible}
            matches={allMatches}
            currentPlayerId={id}
            onSubmit={async (data, uri) => {
              await addVideoClip(data, uri)
              setUploadVisible(false)
            }}
            onClose={() => setUploadVisible(false)}
          />

          <RNModal visible={playbackUrl !== null} animationType="fade" onRequestClose={() => setPlaybackUrl(null)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
              <Pressable
                onPress={() => setPlaybackUrl(null)}
                style={{ padding: Spacing.md }}
                accessibilityRole="button"
                accessibilityLabel="Cerrar reproductor">
                <MaterialIcons name="close" size={28} color="#fff" />
              </Pressable>
              {playbackUrl && <VideoView player={player} style={{ flex: 1 }} nativeControls />}
            </SafeAreaView>
          </RNModal>
```

- [ ] **Step 3: Add the new styles**

In the `StyleSheet.create({...})` block at the bottom of the file, add:

```ts
  clipFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  clipFilterChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  uploadClipBtn: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  uploadClipBtnText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
  },
  clipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
```

(These stay inline in this file's existing `StyleSheet.create` block rather than a separate `.styles.ts`, matching the pattern this specific file already uses — only new standalone component files follow the `.styles.ts` convention per the Global Constraints note.)

- [ ] **Step 4: Verify — typecheck**

Run (from `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Verify — manual check in Expo**

Run: `pnpm --filter @fulbito/mobile start`, open the app (Expo Go or a simulator/device), sign in as admin, navigate to a player's detail screen.
Check:
- "Clips" section renders below "Últimos partidos" with category filter chips.
- "+ Subir clip" opens the upload modal; picking a match shows its players with the current player pre-checked; picking a video via the library and submitting closes the modal and the clip appears in the grid.
- Tapping a clip card opens the fullscreen player and it plays with native controls; closing returns to the detail screen.
- Deleting a clip asks for confirmation and removes it.
- As a non-admin user, "+ Subir clip" and delete are hidden but clips still play.

- [ ] **Step 6: Commit**

```bash
git add "apps/mobile/app/(tabs)/players/[id].tsx"
git commit -m "feat(mobile): integrate video clips section into player detail screen"
```

---

## After implementation

- Remind the user to run `firebase deploy --only firestore:rules,storage` from the repo root to publish the new `videoClips` rules — nothing uploads/reads correctly against the real project until that's deployed (this is a deploy action; don't run it automatically).
- Remind the user this branch (`feat/add-video-section`) still needs a PR once both platforms are manually verified.
