import { Icons } from "src/constants/icons"
import { Theme } from "src/enums/theme-2"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const StatusbarItemTheme = () => {
  const isDarkTheme = useSelector(() => interfaceStore.isDarkTheme)
  const label = isDarkTheme ? "Dark" : "Light"
  const icon = isDarkTheme ? Icons.ThemeDark : Icons.ThemeLight

  const handleClick = () => {
    if (isDarkTheme) {
      interfaceStore.setTheme(Theme.Light)
    } else {
      interfaceStore.setTheme(Theme.Dark)
    }
  }

  return (
    <div className="Statusbar-item" onClick={handleClick}>
      <img src={icon} alt="Theme" />
      Theme: {label}
    </div>
  )
}
