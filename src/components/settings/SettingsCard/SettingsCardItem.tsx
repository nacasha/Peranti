import { type ReactNode, type FC } from "react"

interface SettingsCardItemProps {
  label: string
  description?: ReactNode
  children?: ReactNode
}

export const SettingsCardItem: FC<SettingsCardItemProps> = (props) => {
  const { label, children, description } = props

  return (
    <div className="SettingsCardItem">
      <div className="SettingsCardItem-text">
        <div className="SettingsCardItem-label">
          {label}
        </div>
        <div className="SettingsCardItem-description">
          {description}
        </div>
      </div>
      <div className="SettingsCardItem-value">
        {children}
      </div>
    </div>
  )
}
