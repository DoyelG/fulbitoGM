import Image from 'next/image'
import Link from 'next/link'
import type { AwardEntry } from '@fulbito/utils'

type Props = { entries: AwardEntry[]; unitLabel: string }

export function AwardRunnersUp({ entries, unitLabel }: Props) {
  if (entries.length === 0) return null

  return (
    <ol className="mt-6 space-y-2">
      {entries.map((entry, index) => (
        <li key={entry.row.id}>
          <Link
            href={`/players/${entry.row.id}`}
            className="flex items-center gap-3 rounded-lg border border-black/5 bg-white/70 px-3 py-2 transition-colors hover:bg-white"
          >
            <span className="w-5 shrink-0 text-sm font-black text-gray-400">{index + 2}º</span>
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
              <Image
                src={entry.row.photoUrl ?? '/silhouette.svg'}
                alt={entry.row.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="flex-1 truncate text-sm font-semibold text-gray-900">{entry.row.name}</span>
            <span className="shrink-0 text-sm font-bold text-gray-900">
              {entry.value} <span className="text-xs font-semibold text-gray-500">{unitLabel}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
