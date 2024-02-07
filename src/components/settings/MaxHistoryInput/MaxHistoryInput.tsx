import React, { type FC } from "react"

import { Input } from "src/components/common/Input"
import { sessionHistoryStore } from "src/stores/sessionHistoryStore"

export const MaxHistoryInput: FC = () => {
  const { numberOfMaximumHistory } = sessionHistoryStore

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    sessionHistoryStore.numberOfMaximumHistory = Number(event.target.value)
  }

  return (
    <Input
      type="number"
      min={0}
      step="10"
      defaultValue={numberOfMaximumHistory}
      onChange={onChange}
      style={{ width: 50 }}
      autoComplete="off"
    />
  )
}
