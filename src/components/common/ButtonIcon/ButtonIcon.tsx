import { type DetailedHTMLProps, type FC } from "react"

import { buttonIconClasses } from "./ButtonIcon.css"

interface ButtonIconProps extends DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  icon: string
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { icon, ...restProps } = props

  return (
    <div className={buttonIconClasses.root} {...restProps}>
      <img src={icon} className={buttonIconClasses.icon} />
    </div>
  )
}
