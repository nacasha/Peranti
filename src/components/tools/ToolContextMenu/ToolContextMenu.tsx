import { type ComponentProps, type FC } from "react"
import { Item, type ItemParams } from "react-contexify"

import { ContextMenu } from "src/components/common/ContextMenu"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { type ToolComponent } from "src/models/ToolComponent"
import { ClipboardService } from "src/services/clipboardService"
import { FileService } from "src/services/fileService"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"

interface MenuParams {
  toolInput?: ToolInput
  toolOutput?: ToolOutput
  component: ToolComponent
}

type ToolContextMenuItemParams = ItemParams<MenuParams>

export const ToolContextMenu: FC = () => {
  const getValue = (itemParams: ToolContextMenuItemParams) => {
    const { toolInput, toolOutput } = itemParams.props ?? {}
    if (toolOutput) {
      return toolRunnerStore.getActiveTool().getOutputValue(toolOutput.key)
    }
    if (toolInput) {
      return toolRunnerStore.getActiveTool().getInputValue(toolInput.key)
    }
  }

  const isHideCopy: ComponentProps<typeof Item>["hidden"] = ({ props }) => {
    const { component } = props as MenuParams
    return !component.copyAs
  }

  const isHideSaveAsFile: ComponentProps<typeof Item>["hidden"] = ({ props }) => {
    const { component } = props as MenuParams
    return !component.saveAs
  }

  const isHidePaste: ComponentProps<typeof Item>["hidden"] = ({ props }) => {
    const { component } = props as MenuParams
    return !component.pasteFrom
  }

  const isHidePasteFromFile: ComponentProps<typeof Item>["hidden"] = ({ props }) => {
    const { component } = props as MenuParams
    return !component.readFileMimes
  }

  const handleClickSaveToFile = (itemParams: ToolContextMenuItemParams) => {
    const { component } = itemParams.props ?? {}

    if (component) {
      const { saveAs } = component
      const savedValue = getValue(itemParams)

      if (savedValue) {
        if (saveAs === "text") {
          void FileService.saveToTextFile(savedValue)
        } else if (saveAs === "image") {
          void FileService.saveToImageFile(savedValue)
        }
      }
    }
  }

  const handleClickCopy = (itemParams: ToolContextMenuItemParams) => {
    const { component } = itemParams.props ?? {}

    if (component) {
      const { copyAs } = component
      const copiedValue = getValue(itemParams)

      if (copiedValue) {
        if (copyAs === "text") {
          void ClipboardService.copyText(copiedValue)
        }
      }
    }
  }

  const handleClickPickFile = (itemParams: ToolContextMenuItemParams) => {
    const { toolInput, component } = itemParams.props ?? {}

    if (toolInput && component) {
      void FileService.openAndReadFile()
        .then((fileContent) => {
          toolRunnerStore.getActiveTool().setInputValue(toolInput.key, fileContent)
          toolRunnerStore.getActiveTool().forceRerender()
        })
    }
  }

  return (
    <ContextMenu
      animation=""
      id={ContextMenuKeys.ToolOutput}
    >
      <Item
        id="copy"
        onClick={handleClickCopy}
        hidden={isHideCopy}
      >
        Copy
      </Item>
      <Item
        id="paste"
        onClick={handleClickCopy}
        hidden={isHidePaste}
      >
        Paste
      </Item>
      <Item
        id="pick-from-file"
        onClick={handleClickPickFile}
        hidden={isHidePasteFromFile}
      >
        Pick File and Drop Here
      </Item>
      <Item
        id="save-to-file"
        onClick={handleClickSaveToFile}
        hidden={isHideSaveAsFile}
      >
        Save To File
      </Item>
    </ContextMenu>
  )
}
