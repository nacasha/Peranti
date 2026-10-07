import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { ToolSidebarDensity } from "src/enums/tool-sidebar-density"
import { useSelector } from "src/hooks/useSelector"
import { toolSidebarService } from "src/services/tool-sidebar-service"

export const ToolSidebarDensitySelect: FC = () => {
  const density = useSelector(() => toolSidebarService.density)

  const onChange = (value: ToolSidebarDensity) => {
    toolSidebarService.setDensity(value)
  }

  return (
    <Dropdown<ToolSidebarDensity>
      value={density}
      options={[
        { label: "Compact", value: ToolSidebarDensity.Compact },
        { label: "Default", value: ToolSidebarDensity.Default },
        { label: "Comfortable", value: ToolSidebarDensity.Comfortable }
      ]}
      onChange={onChange}
    />
  )
}
