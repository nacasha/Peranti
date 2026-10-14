import { type FC, type ReactNode } from "react"

interface DialogContentProps {
  children?: ReactNode
}

export const DialogContent: FC<DialogContentProps> = (props) => {
  const { children } = props

  return (
    <div className="Dialog-content">
      {children}
    </div>
  )
}
