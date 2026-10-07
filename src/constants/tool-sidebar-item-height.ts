import { ToolSidebarDensity } from "src/enums/tool-sidebar-density"

/**
 * Row height of each tool sidebar item (`--tool-sidebar-item-height` in variables.scss)
 */
export const ToolSidebarItemHeight: Record<ToolSidebarDensity, string> = {
  [ToolSidebarDensity.Compact]: "26px",
  [ToolSidebarDensity.Default]: "32px",
  [ToolSidebarDensity.Comfortable]: "38px"
}
