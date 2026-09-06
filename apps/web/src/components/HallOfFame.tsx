import Image from 'next/image'
import Link from 'next/link'
import type { HallOfFameEntry } from '@/hooks/use-annual-awards'

type Props = { entries: HallOfFameEntry[] }

export function HallOfFame({ entries }: Props) {
  return (
    <section aria-label="Hall of Fame" className="bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <span className="mb-3 inline-block h-1.5 w-10 rounded-full bg-amber-400" />
        <h2 className="text-2xl font-black italic tracking-tight">Hall of Fame</h2>
        <p className="mt-2 text-gray-700">Los que llegaron a 7 victorias seguidas y se coronaron campeones.</p>

        {entries.length === 0 ? (
          <p className="mt-10 rounded-xl border border-amber-200 bg-white p-8 text-center text-lg text-gray-700">
            Nadie pudo pasar a la eternidad, sé el primero.
          </p>
        ) : (
          <ol className="mt-10 space-y-8">
            {entries.map((entry) => (
              <li key={entry.year}>
                <p className="mb-3 text-sm font-black tracking-[0.2em] text-amber-600">{entry.year}</p>
                <ul className="space-y-3">
                  {entry.champions.map((champion) => (
                    <li key={champion.playerId}>
                      <Link
                        href={`/players/${champion.playerId}`}
                        className="flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-300">
                          <Image
                            src={champion.playerPhotoUrl ?? '/silhouette.svg'}
                            alt={champion.playerName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="flex-1 truncate font-bold text-gray-900">{champion.playerName}</span>
                        <span className="text-sm font-semibold text-amber-700">
                          🏆 {champion.streak} victorias seguidas
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
