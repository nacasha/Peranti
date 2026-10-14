import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { CardShadow } from "src/enums/card-shadow"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const CardShadowSelect: FC = () => {
  const cardShadow = useSelector(() => interfaceStore.cardShadow)

  const onChange = (value: CardShadow) => {
    interfaceStore.setCardShadow(value)
  }

  return (
    <Dropdown<CardShadow>
      value={cardShadow}
      options={[
        { label: "None", value: CardShadow.None },
        { label: "Subtle", value: CardShadow.Subtle },
        { label: "Medium", value: CardShadow.Medium },
        { label: "Strong", value: CardShadow.Strong }
      ]}
      onChange={onChange}
    />
  )
}
