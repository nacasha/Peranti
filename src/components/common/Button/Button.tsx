import { type ClassValue, clsx } from "clsx"
import { type DetailedHTMLProps, type FC, type HTMLAttributes, type ReactNode } from "react"

import "./Button.scss"

interface ButtonProps {
  className?: ClassValue[]
  icon?: string
  children?: ReactNode
  onClick?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>["onClick"]
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon, className, onClick } = props

  return (
    <div
      className={clsx("Button", className)}
      onClick={onClick}
    >
      {icon && <img src={icon} alt={children?.toString()} />}
      {children}
    </div>
  )
}
