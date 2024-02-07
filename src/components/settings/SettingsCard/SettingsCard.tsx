import { type ReactNode, type FC } from "react"

import "./SettingsCard.scss"

interface SettingsCardProps {
  title?: string
  children?: ReactNode
}

export const SettingsCard: FC<SettingsCardProps> = (props) => {
  const { title, children } = props

  return (
    <div className="SettingsCard">
      {title && (
        <div className="SettingsCard-title">
          {title}
        </div>
      )}
      <div className="SettingsCard-body">
        {children}
      </div>
    </div>
  )
}
