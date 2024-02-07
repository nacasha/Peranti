import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { FileDropAction } from "src/enums/file-drop-action.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { componentService } from "src/services/component-manager.js"
import { getUserSettings, watchUserSettings } from "src/utils/decorators.js"
import { getFileNameFromPath } from "src/utils/get-file-name-from-path.js"

import { activeAppletStore } from "./active-applet-store.js"
import { appletStore } from "./applet-store.js"
import { sessionStore } from "./session-store.js"

class FileDropService {
  @watchUserSettings(UserSettingsKeys.fileDropAction)
  fileDropAction: FileDropAction = getUserSettings(
    UserSettingsKeys.fileDropAction,
    FileDropAction.AlwaysAsk
  )

  @watchUserSettings(UserSettingsKeys.droppedFileReplaceSessionName)
  droppedFileReplaceSessionName: boolean = getUserSettings(
    UserSettingsKeys.droppedFileReplaceSessionName,
    false
  )

  droppedFilePaths: string[] = []

  isHoveringFile: boolean = false

  isDroppingFile: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  setIsHovering(value: boolean) {
    this.isHoveringFile = value
  }

  setDroppedFilePaths(filePaths: string[]) {
    this.droppedFilePaths = filePaths
  }

  setIsDroppingFile(value: boolean) {
    this.isDroppingFile = value
  }

  resetState() {
    this.isHoveringFile = false
    this.isDroppingFile = false
    this.droppedFilePaths = []
  }

  async readFileAndOpenSession(filePath: string, newSession: boolean = false) {
    const activeTool = activeAppletStore.getActiveApplet()

    if (activeTool.appletId === "") {
      return
    }

    const [inputFields, isAvailableOnBatchMode] = activeTool.getInputFieldsWithReadableFile()

    const { key: inputFieldKey, component } = inputFields[0]
    const inputComponent = componentService.getInputComponent(component, isAvailableOnBatchMode)
    const fileName = getFileNameFromPath(filePath)

    try {
      const fileContent = await componentService.readFileFromComponent(inputComponent, filePath)

      if (fileContent) {
        const sessionName = this.droppedFileReplaceSessionName ? fileName : undefined

        if (newSession) {
          const toolConstructor = appletStore.mapOfLoadedApplets[activeTool.appletId]
          const createdSession = sessionStore.createSession(toolConstructor, {
            initialState: {
              sessionName,
              inputValues: { [inputFieldKey]: fileContent }
            }
          })

          if (isAvailableOnBatchMode && createdSession) {
            createdSession.setBatchMode(true)
          }
        } else {
          if (sessionName) {
            await sessionStore.renameSession(activeTool.toSession(), sessionName)
          }

          if (!activeTool.isBatchModeEnabled && isAvailableOnBatchMode) {
            activeTool.setBatchMode(true)
          }

          activeTool.setInputValue(inputFieldKey, fileContent)
          activeTool.resetInputAndOutputFieldsState()
          activeTool.forceRerender()
        }
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} file as text`)
    }
  }

  async proceedFileDropBasedOnAction() {
    if (this.droppedFilePaths.length > 0) {
      if (this.fileDropAction === FileDropAction.ReplaceCurrentEditor) {
        await this.replaceCurrentSessionAndOpenNew()
      } else if (this.fileDropAction === FileDropAction.OpenInNewEditor) {
        await this.openInNewSession()
      }
    }

    this.resetState()
  }

  async replaceCurrentSession() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await this.readFileAndOpenSession(filePath)
    }

    this.resetState()
  }

  async replaceCurrentSessionAndOpenNew() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await this.readFileAndOpenSession(filePath, index > 0)
    }

    this.resetState()
  }

  async openInNewSession() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await this.readFileAndOpenSession(filePath, true)
    }

    this.resetState()
  }

  setFileDropAction(value: FileDropAction) {
    this.fileDropAction = value
  }
}

export const fileDropService = new FileDropService()
