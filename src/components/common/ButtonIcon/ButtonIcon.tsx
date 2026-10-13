import { clsx } from "clsx"
import { type DetailedHTMLProps, type FC } from "react"

import { type Icon as IconType } from "src/constants/icons"

import { Tooltip } from "../Tooltip"

import "./ButtonIcon.scss"

interface ButtonIconProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  icon: IconType
  tooltip: string
  iconSize?: number

  /**
   * Greyed out and ignores clicks, the tooltip still shows to say why
   */
  disabled?: boolean
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { icon: Icon, tooltip, iconSize = 15, disabled, className, onClick, ...restProps } = props

  return (
    <Tooltip overlay={tooltip}>
      <div
        className={clsx("ButtonIcon", disabled && "disabled", className)}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onClick}
        {...restProps}
      >
        <Icon size={iconSize} aria-label={tooltip || undefined} />
      </div>
    </Tooltip>
  )
}
