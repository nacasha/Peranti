import { type ComponentProps, type FC } from "react"
import { Item, type ItemParams } from "react-contexify"

import { ContextMenu } from "src/components/common/ContextMenu"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { type Component } from "src/models/Component"
import { activeAppletStore } from "src/services/active-applet-store"
import { ClipboardService } from "src/services/clipboard-service"
import { componentService } from "src/services/component-manager"
import { FileService } from "src/services/file-service"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOutput } from "src/types/AppletOutput"

interface MenuParams {
  appletInput?: AppletInput
  appletOutput?: AppletOutput
  component: Component
}

type ContextMenuItemParams = ItemParams<MenuParams>

export const AppletContextMenu: FC = () => {
  const getValue = (itemParams: ContextMenuItemParams) => {
    const { appletInput, appletOutput } = itemParams.props ?? {}
    if (appletOutput) {
      return activeAppletStore.getActiveApplet().getOutputValue(appletOutput.key)
    }
    if (appletInput) {
      return activeAppletStore.getActiveApplet().getInputValue(appletInput.key)
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

  const handleClickSaveToFile = (itemParams: ContextMenuItemParams) => {
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

  const handleClickCopy = (itemParams: ContextMenuItemParams) => {
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

  const handleClickPickFile = async(itemParams: ContextMenuItemParams) => {
    const { appletInput, component } = itemParams.props ?? {}

    if (appletInput && component) {
      const fileContent = await componentService.openFileAndReadFromComponent(component)

      if (fileContent) {
        activeAppletStore.getActiveApplet().setInputValue(appletInput.key, fileContent)
        activeAppletStore.getActiveApplet().forceRerender()
      }
    }
  }

  return (
    <ContextMenu id={ContextMenuKeys.AppletComponent}>
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
        onClick={(itemParams) => { void handleClickPickFile(itemParams) }}
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
