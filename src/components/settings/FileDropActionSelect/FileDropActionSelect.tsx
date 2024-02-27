import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { FileDropAction } from "src/enums/file-drop-action"
import { fileDropService } from "src/services/file-drop-service"

export const FileDropActionSelect: FC = () => {
  const { fileDropAction } = fileDropService

  const onChange = (value: FileDropAction) => {
    fileDropService.setFileDropAction(value)
  }

  return (
    <SelectInput<FileDropAction>
      fieldKey=""
      options={[
        { label: "Always Ask", value: FileDropAction.AlwaysAsk },
        { label: "Open In New Editor", value: FileDropAction.OpenInNewEditor },
        { label: "Replace Current Editor", value: FileDropAction.ReplaceCurrentEditor }
      ]}
      onValueChange={onChange}
      defaultValue={fileDropAction}
    />
  )
}
