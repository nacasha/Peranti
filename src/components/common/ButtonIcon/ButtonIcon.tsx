import { type DetailedHTMLProps, type FC } from "react"

import { Tooltip } from "../Tooltip"

import { buttonIconClasses } from "./ButtonIcon.css"

interface ButtonIconProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  icon: string
  tooltip?: string
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { icon, tooltip, ...restProps } = props

  return (
    <Tooltip overlay={tooltip}>
      <div className={buttonIconClasses.root} {...restProps}>
        <img src={icon} className={buttonIconClasses.icon} />
      </div>
    </Tooltip>
  )
}
