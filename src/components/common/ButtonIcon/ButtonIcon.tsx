import { type DetailedHTMLProps, type FC } from "react"

import { type Icon as IconType } from "src/constants/icons"

import { Tooltip } from "../Tooltip"

import "./ButtonIcon.scss"

interface ButtonIconProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  icon: IconType
  tooltip: string
  iconSize?: number
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { icon: Icon, tooltip, iconSize = 15, ...restProps } = props

  return (
    <Tooltip overlay={tooltip}>
      <div className="ButtonIcon" {...restProps}>
        <Icon size={iconSize} aria-label={tooltip || undefined} />
      </div>
    </Tooltip>
  )
}
