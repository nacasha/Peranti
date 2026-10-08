import { clsx } from "clsx"
import { type ButtonHTMLAttributes, type DetailedHTMLProps, type FC, type ReactNode } from "react"

import { type Icon as IconType } from "src/constants/icons"

import "./Button.scss"

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon?: IconType
  children?: ReactNode
  active?: boolean
  /**
   * Ghost by default; "primary" and "danger" are filled, for a dialog's main
   * action
   */
  variant?: "default" | "primary" | "danger"
}

export const Button: FC<ButtonProps> = (props) => {
  const { children, icon: Icon, className, active, variant = "default", ...restProps } = props

  return (
    <button
      className={clsx("Button", `Button-${variant}`, className, { active })}
      {...restProps}
    >
      {Icon && <Icon className="Button-icon" size={14} aria-hidden />}
      {children ?? null}
    </button>
  )
}
