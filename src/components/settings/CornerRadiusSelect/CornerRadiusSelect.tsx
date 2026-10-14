import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { CornerRadius } from "src/enums/corner-radius"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const CornerRadiusSelect: FC = () => {
  const cornerRadius = useSelector(() => interfaceStore.cornerRadius)

  const onChange = (value: CornerRadius) => {
    interfaceStore.setCornerRadius(value)
  }

  return (
    <Dropdown<CornerRadius>
      value={cornerRadius}
      options={[
        { label: "None", value: CornerRadius.None },
        { label: "Small", value: CornerRadius.Small },
        { label: "Default", value: CornerRadius.Default },
        { label: "Large", value: CornerRadius.Large }
      ]}
      onChange={onChange}
    />
  )
}
