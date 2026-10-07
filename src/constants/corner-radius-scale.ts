import { CornerRadius } from "src/enums/corner-radius"

/**
 * Multiplier applied to every radius token (`--radius-scale` in variables.scss)
 */
export const CornerRadiusScale: Record<CornerRadius, string> = {
  [CornerRadius.None]: "0",
  [CornerRadius.Small]: "0.5",
  [CornerRadius.Default]: "1",
  [CornerRadius.Large]: "1.5"
}
