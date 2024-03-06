import { type DetailedHTMLProps, type FC } from "react"

import { Tooltip } from "../Tooltip"

import "./ButtonIcon.scss"

interface ButtonIconProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  icon: string
  tooltip: string
  iconSize?: number
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { icon, tooltip, iconSize, ...restProps } = props

  return (
    <Tooltip overlay={tooltip}>
      <div className="ButtonIcon" {...restProps}>
        <img src={icon} style={{ width: iconSize }} />
      </div>
    </Tooltip>
  )
}
