import { type FC } from "react"

interface ButtonIconProps {
  onClick: () => any
  children: React.ReactNode
}

export const ButtonIcon: FC<ButtonIconProps> = (props) => {
  const { onClick, children } = props

  return (
    <div className="ButtonIcon">
      <button onClick={onClick}>{children}</button>
    </div>
  )
}
