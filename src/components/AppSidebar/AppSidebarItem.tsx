import { type FC } from "react"
import { useLocation } from "wouter"

interface AppSidebarItemProps {
  path: string
  label: string
  icon: string
}

export const AppSidebarItem: FC<AppSidebarItemProps> = (props) => {
  const { icon, label, path } = props
  const [location, navigate] = useLocation()

  const onClickItem = () => () => {
    navigate(path)
  }

  const isActive = () => {
    return location === path
  }

  return (
    <div className={"AppSidebarItem".concat(isActive() ? " active" : "")} onClick={onClickItem()}>
      <div className="tooltip">
        {label}
      </div>
      <img src={icon} alt={label} />
    </div>
  )
}
