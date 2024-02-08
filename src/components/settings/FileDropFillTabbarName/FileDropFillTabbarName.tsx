import { observer } from "mobx-react"
import { type FC } from "react"

import { Switch } from "src/components/common/Switch"
import { fileDropService } from "src/services/file-drop-service"

export const FileDropFillTabbarName: FC = observer(() => {
  const onToggleSwitch = (checked: boolean) => {
    fileDropService.setDroppedFileReplaceSessionName(checked)
  }

  return (
    <Switch
      defaultChecked={fileDropService.droppedFileReplaceSessionName}
      onChange={onToggleSwitch}
    />
  )
})
