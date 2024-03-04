import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { FileDropAction } from "src/enums/file-drop-action.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { appletComponentService } from "src/services/applet-component-service.js"
import { getFileNameFromPath } from "src/utils/get-file-name-from-path.js"

import { activeAppletStore } from "./active-applet-store.js"
import { appletStore } from "./applet-store.js"
import { sessionStore } from "./session-store.js"
import { userSettingsService } from "./user-settings-service.js"

class FileDropService {
  @userSettingsService.watch(UserSettingsKeys.fileDropAction)
  fileDropAction: FileDropAction = userSettingsService.get(
    UserSettingsKeys.fileDropAction,
    FileDropAction.AlwaysAsk
  )

  @userSettingsService.watch(UserSettingsKeys.fileDropReplaceSessionName)
  droppedFileReplaceSessionName: boolean = userSettingsService.get(
    UserSettingsKeys.fileDropReplaceSessionName,
    false
  )

  droppedFilePaths: string[] = []

  isHoveringFile: boolean = false

  isDroppingFile: boolean = false

  constructor() {
    makeAutoObservable(this)
    userSettingsService.watchStore(this)
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
    const activeApplet = activeAppletStore.getActiveApplet()

    if (activeApplet.appletId === "") {
      return
    }

    const [inputFields, isAvailableOnBatchMode] = activeApplet.getInputFieldsWithReadableFile()

    if (inputFields.length === 0) {
      toast.error(`Current tool ${activeApplet.name} does not support file drop`)
      this.resetState()
      return
    }

    const { key: inputFieldKey, component } = inputFields[0]
    const inputComponent = appletComponentService.getInputComponent(component, isAvailableOnBatchMode)
    const fileName = getFileNameFromPath(filePath)

    try {
      const fileContent = await appletComponentService.readFileFromComponent(inputComponent, filePath)

      if (fileContent) {
        const sessionName = this.droppedFileReplaceSessionName ? fileName : undefined

        if (newSession) {
          const appletConstructor = appletStore.mapOfLoadedApplets[activeApplet.appletId]
          const createdSession = sessionStore.createSession(appletConstructor, {
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
            await sessionStore.renameSession(activeApplet.toSession(), sessionName)
          }

          if (!activeApplet.isBatchModeEnabled && isAvailableOnBatchMode) {
            activeApplet.setBatchMode(true)
          }

          activeApplet.setInputValue(inputFieldKey, fileContent)
          activeApplet.resetInputAndOutputFieldsState()
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

  setDroppedFileReplaceSessionName(value: boolean) {
    this.droppedFileReplaceSessionName = value
  }
}

export const fileDropService = new FileDropService()
