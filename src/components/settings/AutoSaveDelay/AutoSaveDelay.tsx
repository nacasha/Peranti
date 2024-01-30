import React from "react"

import { Input } from "src/components/common/Input"
import { toolHistoryStore } from "src/stores/toolHistoryStore.ts"

export const AutoSaveDelay = () => {
  const { autoSaveDelayInSeconds } = toolHistoryStore

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    toolHistoryStore.autoSaveDelayInSeconds = Number(event.target.value)
  }

  return (
    <Input
      type="number"
      min={0}
      step="1"
      defaultValue={autoSaveDelayInSeconds}
      onChange={onChange}
      style={{ width: 50 }}
      autoComplete="off"
    />
  )
}
