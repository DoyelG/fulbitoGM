import { Children } from "react"

type Props = {
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Backdrop ({onClose, title, children}: Props) {
  return (
     <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >{children}</div>
  )
}
