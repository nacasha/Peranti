import { ColorScheme } from "src/enums/color-scheme"

/**
 * Color schemes offered in Settings. Each one restyles the palette of both
 * light and dark themes (styles/themes/schemes), a theme a scheme has no
 * palette for keeps the default look.
 */
export const ColorSchemes = [
  { label: "Default", value: ColorScheme.Default },
  { label: "Nord", value: ColorScheme.Nord },
  { label: "Solarized", value: ColorScheme.Solarized },
  { label: "Dracula (dark only)", value: ColorScheme.Dracula }
]
