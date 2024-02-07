import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { UserSettingsKeys } from "src/enums/UserSettingsKeys.js"
import { toolComponentService } from "src/services/toolComponentService"
import { getUserSettings, watchUserSettings } from "src/utils/decorators.js"
import { getFileNameFromPath } from "src/utils/getFileNameFromPath"

import { activeSessionStore } from "./activeSessionStore.js"
import { sessionStore } from "./sessionStore.js"
import { toolStore } from "./toolStore.js"

export enum FileDropAction {
  ReplaceCurrentTool = "replace-current-tool",
  OpenInNewEditor = "open-in-new-editor",
  AlwaysAsk = "always-ask",
}

class FileDropStore {
  @watchUserSettings(UserSettingsKeys.fileDropAction)
  fileDropAction: FileDropAction = getUserSettings(
    UserSettingsKeys.fileDropAction,
    FileDropAction.AlwaysAsk
  )

  droppedFileReplaceSessionName: boolean = true

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
    const activeTool = activeSessionStore.getActiveTool()

    if (activeTool.toolId === "") {
      return
    }

    const [inputFields, isAvailableOnBatchMode] = activeTool.getInputFieldsWithReadableFile()

    const { key: inputFieldKey, component } = inputFields[0]
    const inputComponent = toolComponentService.getInputComponent(component, isAvailableOnBatchMode)
    const fileName = getFileNameFromPath(filePath)

    try {
      const fileContent = await toolComponentService.readFileFromToolComponent(inputComponent, filePath)

      if (fileContent) {
        const sessionName = this.droppedFileReplaceSessionName ? fileName : undefined

        if (newSession) {
          const toolConstructor = toolStore.mapOfLoadedTools[activeTool.toolId]
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
      if (this.fileDropAction === FileDropAction.ReplaceCurrentTool) {
        await this.replaceCurrentToolAndOpenNew()
      } else if (this.fileDropAction === FileDropAction.OpenInNewEditor) {
        await this.openInNewSession()
      }
    }

    fileDropStore.resetState()
  }

  async replaceCurrentTool() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await fileDropStore.readFileAndOpenSession(filePath)
    }

    fileDropStore.resetState()
  }

  async replaceCurrentToolAndOpenNew() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await fileDropStore.readFileAndOpenSession(filePath, index > 0)
    }

    fileDropStore.resetState()
  }

  async openInNewSession() {
    for (let index = 0; index < this.droppedFilePaths.length; index++) {
      const filePath = this.droppedFilePaths[index]
      await fileDropStore.readFileAndOpenSession(filePath, true)
    }

    fileDropStore.resetState()
  }
}

export const fileDropStore = new FileDropStore()
