import React, { type FC } from "react"

import { Input } from "src/components/common/Input"
import { toolHistoryStore } from "src/stores/toolHistoryStore.ts"

export const MaxHistoryInput: FC = () => {
  const { numberOfMaximumHistory } = toolHistoryStore

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    toolHistoryStore.numberOfMaximumHistory = Number(event.target.value)
  }

  return (
    <Input
      type="number"
      min={0}
      step="10"
      defaultValue={numberOfMaximumHistory}
      onChange={onChange}
      style={{ width: 50 }}
    />
  )
}
