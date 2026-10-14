import { type LayoutSetting } from "src/types/LayoutSetting"

/**
 * Row sizes taken from the content, where a field has no height until its
 * content gives it one
 */
const contentSizes = ["min-content", "max-content", "auto"]

function isContentSize(size: string) {
  return contentSizes.includes(size) || size.startsWith("fit-content(")
}

/**
 * Sizes of the rows a named area spans in a CSS `grid-template`, such as
 * `"'input' min-content 'output' 1fr / 1fr"`. A row with no size is `auto`.
 */
function getAreaRowSizes(template: string, area: string): string[] {
  // Rows come before the columns, after a "/" outside parentheses
  let depth = 0
  let rowsEnd = template.length
  for (let index = 0; index < template.length; index++) {
    const character = template[index]
    if (character === "(") depth++
    else if (character === ")") depth--
    else if (character === "/" && depth === 0) {
      rowsEnd = index
      break
    }
  }

  // Quoted rows, line names and sizes, keeping "minmax(a, b)" whole
  const tokens = template.slice(0, rowsEnd).match(/'[^']*'|"[^"]*"|\[[^\]]*\]|[^\s(]+\([^)]*\)|[^\s[]+/g) ?? []
  const sizes: string[] = []

  tokens.forEach((token, index) => {
    if (!/^['"]/.test(token) || !token.slice(1, -1).trim().split(/\s+/).includes(area)) {
      return
    }
    const next = tokens[index + 1]
    sizes.push(next && !/^['"[]/.test(next) ? next : "auto")
  })

  return sizes
}

function isAreaContentSized(template: string | undefined, area: string) {
  const sizes = template ? getAreaRowSizes(template, area) : []
  return sizes.length > 0 && sizes.every(isContentSize)
}

/**
 * Whether the layout sizes a field by its content, so it should be as tall
 * as its content: its area sits in a `min-content` row of the area grid, or
 * the field in one of its fields grid. Flex and `fr` rows give the field a
 * place to fill instead. Batch mode and a maximized field lay everything out
 * side by side, filling the window.
 */
export function isFieldContentSized(
  layoutSetting: LayoutSetting,
  type: "input" | "output",
  fieldKey: string,
  isSideBySide = false
): boolean {
  if (isSideBySide) {
    return false
  }

  if (layoutSetting.areaType === "grid" && isAreaContentSized(layoutSetting.areaGridTemplate, type)) {
    return true
  }

  if (layoutSetting.fieldsType === "grid") {
    const template = type === "input" ? layoutSetting.fieldsInputGridTemplate : layoutSetting.fieldsOutputGridTemplate
    return isAreaContentSized(template, fieldKey)
  }

  return false
}
