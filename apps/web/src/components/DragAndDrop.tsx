'use client'

import type { DragEvent, ReactNode } from 'react'
import { FaGripVertical } from 'react-icons/fa'

export type DropTarget = 'unassigned' | 'a' | 'b'

const BORDER_BY_TEAM: Record<Exclude<DropTarget, 'unassigned'>, string> = {
  a: 'border-primary',
  b: 'border-secondary',
}

type DropColumnProps = {
  title: string
  subtitle?: string
  target?: DropTarget
  playersCount: number
  limit?: number
  listClassName?: string
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  children: ReactNode
}

export function DropColumn({
  title,
  subtitle,
  target,
  playersCount,
  limit,
  listClassName = '',
  onDrop,
  children,
}: DropColumnProps) {
  const isUnassigned = target === undefined || target === 'unassigned'
  const teamStyles = isUnassigned ? 'flex flex-col bg-gray-100' : `border-t-4 ${BORDER_BY_TEAM[target]} bg-white shadow`
  const hasLimit = limit !== undefined && limit > 0

  return (
    <div className={`rounded-lg p-4 ${teamStyles}`} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h4 className="shrink-0 whitespace-nowrap font-semibold">{title}</h4>
        {isUnassigned ? (
          <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold">{playersCount}</span>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            {hasLimit && (
              <div aria-hidden="true" className="flex min-w-0 max-w-40 flex-1 items-center gap-1">
                {Array.from({ length: limit }, (_, index) => (
                  <div key={index} className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full bg-primary transition-[width] duration-400 ease-out ${index < playersCount ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="shrink-0 text-sm">{hasLimit ? `${playersCount}/${limit}` : playersCount}</p>
          </div>
        )}
      </div>
      {subtitle && <p className="mb-2 text-sm text-gray-500">{subtitle}</p>}
      {isUnassigned ? (
        <div className="relative min-h-40 flex-1">
          <div className="absolute inset-0 grid content-start gap-2 overflow-y-auto">{children}</div>
        </div>
      ) : (
        <div className={`grid gap-2 ${listClassName}`.trim()}>
          {children}
          {hasLimit &&
            Array.from({ length: Math.max(limit - playersCount, 0) }, (_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 py-4 text-gray-400"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full border border-dashed text-sm">
                  {playersCount + index + 1}
                </span>
                Soltar jugador
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

type DraggableItemProps<T> = {
  data: T
  label: string
  onClick?: () => void
  isGoalkeeper?: boolean
}

export function DraggableItem<T>({ data, label, onClick, isGoalkeeper }: DraggableItemProps<T>) {
  return (
    <div
      draggable
      onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify(data))}
      className="relative cursor-grab rounded border border-gray-200 bg-white px-8 py-2 hover:shadow active:cursor-grabbing"
      onClick={onClick}
    >
      <FaGripVertical aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-300" />
      <span className="block text-center font-medium">
        {label}
        {isGoalkeeper ? ' 🧤' : ''}
      </span>
    </div>
  )
}
