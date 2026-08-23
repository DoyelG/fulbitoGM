# Player Video Clips — Design

## Context

Ticket: "Since we have match videos to review, add a section on player detail page where clips can be uploaded, so I can see highlights, bloopers, goals, etc from previous matches."

Scope: `apps/web` and `apps/mobile`. Greenfield — no existing video-related code anywhere in the repo.

## Data model

New top-level Firestore collection: `videoClips`. Not a subcollection of `players`, because a clip can involve multiple players and doesn't belong to a single "owner" — a flat collection allows querying by `playerId` (`array-contains`) or `matchId` directly.

New type in `packages/types/src/video-clip.ts`, exported from `packages/types/src/index.ts`, following the existing `Player`/`Match` convention (plain object, `id: string`, `createdAt`/`updatedAt: Date` converted from Firestore `Timestamp` at the read boundary):

```ts
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
```

- `matchId` is required — the upload flow always starts by picking a match.
- `playerIds` has at least one entry — pre-filled with the current profile's player plus any additional players tagged.
- No `size`/`duration`/`mimeType` fields — nothing validates or uses them, so they add no value (YAGNI).
- No file size limit and no file format restriction, by explicit decision.

## Storage

Path convention: `videoClips/{clipId}` (no extension — `uploadBytes` infers `contentType` from the `File`/`Blob`, same as the implicit behavior with player photos today).

## Firebase helpers — centralization decision

Existing inconsistency in the codebase: `packages/firebase` already exposes helpers (`uploadPlayerPhoto`, `players.ts` CRUD), but neither the web Zustand store nor `PlayerForm.tsx` use them — both call `firebase/storage`/`firebase/firestore` directly inline. Web and mobile each duplicate their own upload logic for photos.

Decision for video clips: **centralize in `packages/firebase/src/video-clips.ts`**, since this is new code shared by two apps that need identical behavior:

- `uploadVideoClip(file, clipId)` — Storage upload + `getDownloadURL`.
- `createVideoClip(data)` — Firestore doc creation.
- `getVideoClips()` — fetch + map Firestore docs to `VideoClip` (Timestamp → Date conversion, mirroring `docToPlayer`).
- `deleteVideoClip(id)` — deletes both the Firestore doc and the Storage object.

This does not retrofit the existing player-photo duplication — it only applies the cleaner pattern going forward for this new feature.

## State management

Same pattern as `usePlayerStore`/`useMatchStore`:

- **Web:** `apps/web/src/store/useVideoClipStore.ts` — `videoClips: VideoClip[]`, `videoClipsInit: 'idle' | 'loading' | 'loaded' | 'error'`, `initLoad()` (loads the whole collection, same as `players`/`matches` today), `addVideoClip(data, file)` (uploads the file via the `packages/firebase` helper, creates the doc, then `resetAndReload()`), `deleteVideoClip(id)` (deletes doc + Storage object, updates local state, then reload).
- **Mobile:** analogous hook `hooks/use-video-clips-data.ts`, mirroring `use-players-data.ts`/`use-matches-data.ts`.
- **Player detail page:** filter `videoClips` by `clip.playerIds.includes(player.id)` via `useMemo`, the same "load everything, filter in memory" approach already used for the "Partidos recientes" section — no per-player query needed.

## Web UI (`apps/web/src/app/players/[id]/page.tsx`)

- New card placed after "Partidos recientes", same visual style (`bg-white rounded-lg shadow`).
- Category filter tabs: `Todos | ⚽ Goles | 🌟 Highlights | 🤦 Bloopers | Otros` — local `useState`, not persisted.
- Grid of cards, each showing a generic per-category icon (no real thumbnail — see below), clip title, and the associated match's date.
- "+ Subir clip" button, visible only when `isAdmin` (same gating as the existing avatar upload), opens an upload modal.
- Upload modal (`VideoClipUploadModal.tsx`):
  1. Match select (required) — from already-loaded `matches`.
  2. On match selection, checkboxes for that match's `teamA`/`teamB` players appear, with the current profile's player pre-checked.
  3. Category select (required).
  4. Title (optional).
  5. File input — no `accept` restriction, no size limit.
  6. Submit calls `addVideoClip()`.
- Clicking a card opens a playback modal with `<video controls>` — the file is only fetched at this point, not on grid render.
- Delete icon on each card / inside the playback modal, visible only when `isAdmin`, calls `deleteVideoClip()`.

### Thumbnails

No thumbnail generation (would require server-side processing, out of scope). Cards show a generic icon per category instead of a real video frame, keeping the grid lightweight and avoiding loading video files until the user opens one.

## Mobile UI (`apps/mobile`)

Same behavior, adapted to existing mobile patterns (`apps/mobile/app/(tabs)/players/new.tsx` already uses `expo-image-picker` for photos):

- "Clips" section on the player detail screen, same category filter (tabs or segmented control).
- `FlatList` grid with `numColumns`, generic per-category icon.
- "+ Subir clip" button gated by `isAdmin`, opens a modal/screen with the same flow: match required → suggested players → category → optional title → video picker (`expo-image-picker` with `mediaTypes: ['videos']`).
- Playback via `expo-video` on card tap.
- Delete with `Alert.alert` confirmation, gated by `isAdmin`.
- Styles in a separate `PlayerVideoClips.styles.ts`, per the project's style convention.

## Permissions and validation

- Upload and delete restricted to `isAdmin` (same as the existing player photo gating).
- No file size limit, no file format restriction — explicit decision, not an oversight.
- Firestore/Storage rules for `videoClips`: public read (consistent with `players`/`matches`), authenticated write — add to `firestore.rules`/`storage.rules` following the existing `players` pattern.

## Out of scope

- Thumbnail/preview frame generation.
- File size/duration limits and format validation.
- Surfacing clips on the match detail page (only the player detail page, per the ticket) — a natural follow-up given `matchId` is already required on every clip, but not part of this design.
