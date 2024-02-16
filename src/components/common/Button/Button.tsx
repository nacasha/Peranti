import { clsx } from "clsx"
import { type ButtonHTMLAttributes, type DetailedHTMLProps, type FC, type ReactNode } from "react"

import { buttonClasses } from "./Button.css"

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon?: string
  children?: ReactNode
  active?: boolean
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon, className, active, ...restProps } = props

  return (
    <button
      className={clsx(buttonClasses.root, className, { [buttonClasses.active]: active })}
      {...restProps}
    >
      {icon && <img src={icon} alt={children?.toString()} />}
      {children ?? null}
    </button>
  )
}
