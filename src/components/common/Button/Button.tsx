import { clsx } from "clsx"
import { type ButtonHTMLAttributes, type DetailedHTMLProps, type DOMAttributes, type FC, type ReactNode } from "react"

import "./Button.scss"

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon?: string
  children?: ReactNode
  onClick?: DOMAttributes<HTMLButtonElement>["onClick"]
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon, className, ...restProps } = props

  return (
    <button
      className={clsx("Button", className)}
      {...restProps}
    >
      {icon && <img src={icon} alt={children?.toString()} />}
      {children}
    </button>
  )
}
