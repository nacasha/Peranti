import { Icons } from "src/constants/icons"
import { Theme } from "src/enums/theme-2"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

const THEME_CYCLE = [Theme.System, Theme.Light, Theme.Dark]

const THEME_LABEL = {
  [Theme.System]: "System",
  [Theme.Light]: "Light",
  [Theme.Dark]: "Dark"
}

export const StatusbarItemTheme = () => {
  const theme = useSelector(() => interfaceStore.theme)
  const isDarkTheme = useSelector(() => interfaceStore.isDarkTheme)

  const label = THEME_LABEL[theme]
  const icon = isDarkTheme ? Icons.ThemeDark : Icons.ThemeLight

  const handleClick = () => {
    const nextIndex = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length
    interfaceStore.setTheme(THEME_CYCLE[nextIndex])
  }

  return (
    <div className="Statusbar-item" onClick={handleClick}>
      <img src={icon} alt="Theme" />
      Theme: {label}
    </div>
  )
}
