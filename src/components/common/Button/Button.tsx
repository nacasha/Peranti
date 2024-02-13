import { clsx } from "clsx"
import { type ButtonHTMLAttributes, type DetailedHTMLProps, type DOMAttributes, type FC, type ReactNode } from "react"

import { buttonCss } from "./Button.css"

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon?: string
  children?: ReactNode
  onClick?: DOMAttributes<HTMLButtonElement>["onClick"]
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon, className, ...restProps } = props

  return (
    <button
      className={clsx(buttonCss, className)}
      {...restProps}
    >
      {icon && <img src={icon} alt={children?.toString()} />}
      {children ?? null}
    </button>
  )
}
