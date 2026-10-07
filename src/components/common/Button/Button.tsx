import { clsx } from "clsx"
import { type ButtonHTMLAttributes, type DetailedHTMLProps, type FC, type ReactNode } from "react"

import { type Icon as IconType } from "src/constants/icons"

import "./Button.scss"

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon?: IconType
  children?: ReactNode
  active?: boolean
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon: Icon, className, active, ...restProps } = props

  return (
    <button
      className={clsx("Button", className, { active })}
      {...restProps}
    >
      {Icon && <Icon className="Button-icon" size={14} aria-hidden />}
      {children ?? null}
    </button>
  )
}
