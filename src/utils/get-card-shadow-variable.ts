import { type CardShadow } from "src/enums/card-shadow"

/**
 * CSS value pointing `--card-shadow` at the active theme's preset
 * (`--card-shadow-<level>` in styles/themes), so it follows dark/light switches
 */
export const getCardShadowVariable = (cardShadow: CardShadow) => {
  return `var(--card-shadow-${cardShadow})`
}
