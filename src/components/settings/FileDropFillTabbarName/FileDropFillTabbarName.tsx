import { observer } from "mobx-react"
import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { fileDropService } from "src/services/file-drop-service"

export const FileDropFillTabbarName: FC = observer(() => {
  const onToggleSwitch = (checked: boolean) => {
    fileDropService.setDroppedFileReplaceSessionName(checked)
  }

  return (
    <Checkbox
      defaultChecked={fileDropService.droppedFileReplaceSessionName}
      onChange={onToggleSwitch}
    />
  )
})
