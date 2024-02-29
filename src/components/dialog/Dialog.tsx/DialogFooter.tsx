import { type FC, type ReactNode } from "react"

interface DialogFooterProps {
  children?: ReactNode
}

export const DialogFooter: FC<DialogFooterProps> = (props) => {
  const { children } = props

  return (
    <div className="Dialog-footer">
      {children}
    </div>
  )
}
