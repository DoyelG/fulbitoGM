'use client'

import React from 'react'

export function DropColumn({ title, onDrop, children }: { title: string; onDrop: (e: React.DragEvent<HTMLDivElement>) => void; children: React.ReactNode }) {
  return (
    <div
      className="border-2 border-dashed rounded p-3 min-h-48"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <h4 className="text-center font-semibold mb-2">{title}</h4>
      <div className="grid gap-2 max-h-60 overflow-y-auto">{children}</div>
    </div>
  )
}

export function DraggableItem<T>({ data, label, onClick }: { data: T; label: string; onClick?: () => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(data))}
      className="bg-white border rounded px-3 py-2 text-center hover:shadow"
      onClick={onClick}
    >
      <strong>{label}</strong>
    </div>
  )
}


