import { type ComponentProps, type FC } from "react"
import { type Item, type ItemParams } from "react-contexify"

import { ContextMenu, ContextMenuItem } from "src/components/common/ContextMenu"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { type AppletComponent } from "src/models/AppletComponent"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOutput } from "src/types/AppletOutput"
import { copyComponentValue } from "src/utils/copy-component-value"
import { saveComponentValue } from "src/utils/save-component-value"

interface MenuParams {
  appletInput?: AppletInput
  appletOutput?: AppletOutput
  component: AppletComponent
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
    return !component.readFileAs
  }

  const handleClickSaveToFile = (itemParams: ContextMenuItemParams) => {
    const { component } = itemParams.props ?? {}

    if (component) {
      void saveComponentValue(component, getValue(itemParams))
    }
  }

  const handleClickCopy = (itemParams: ContextMenuItemParams) => {
    const { component } = itemParams.props ?? {}

    if (component) {
      void copyComponentValue(component, getValue(itemParams))
    }
  }

  const handleClickPickFile = async(itemParams: ContextMenuItemParams) => {
    const { appletInput, component } = itemParams.props ?? {}

    if (appletInput && component) {
      const fileContent = await appletComponentService.openFileAndReadFromComponent(component)

      if (fileContent) {
        activeAppletStore.getActiveApplet().setInputValue(appletInput.key, fileContent)
      }
    }
  }

  return (
    <ContextMenu id={ContextMenuKeys.AppletComponent}>
      <ContextMenuItem
        id="copy"
        icon={Icons.Copy}
        onClick={handleClickCopy}
        hidden={isHideCopy}
      >
        Copy
      </ContextMenuItem>
      <ContextMenuItem
        id="paste"
        icon={Icons.Paste}
        onClick={handleClickCopy}
        hidden={isHidePaste}
      >
        Paste
      </ContextMenuItem>
      <ContextMenuItem
        id="pick-from-file"
        icon={Icons.PickFile}
        onClick={(itemParams) => { void handleClickPickFile(itemParams) }}
        hidden={isHidePasteFromFile}
      >
        Pick File and Drop Here
      </ContextMenuItem>
      <ContextMenuItem
        id="save-to-file"
        icon={Icons.SaveToFile}
        onClick={handleClickSaveToFile}
        hidden={isHideSaveAsFile}
      >
        Save To File
      </ContextMenuItem>
    </ContextMenu>
  )
}
