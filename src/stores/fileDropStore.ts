import { makeAutoObservable } from "mobx"
import toast from "react-hot-toast"

import { toolComponentService } from "src/services/toolComponentService"
import { getFileNameFromPath } from "src/utils/getFileNameFromPath"

import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolSessionStore } from "./toolSessionStore.js"
import { toolStore } from "./toolStore.js"

export enum FileDropAction {
  ReplaceCurrentTool,
  OpenInNewEditor,
  AskEveryTime,
}

class FileDropStore {
  /**
   * @configurable
   */
  fileDropAction: FileDropAction = FileDropAction.AskEveryTime

  /**
   * @configurable
   */
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
    const activeTool = toolRunnerStore.getActiveTool()

    if (activeTool.toolId === "") {
      return
    }

    const [inputFields, isAvailableOnBatchMode] = activeTool.getInputFieldsWithMime()

    const { key: inputFieldKey, component } = inputFields[0]
    const inputComponent = toolComponentService.getInputComponent(component, isAvailableOnBatchMode)

    try {
      const fileName = getFileNameFromPath(filePath)
      const fileContent = await toolComponentService.readFileFromToolComponent(inputComponent, filePath)

      if (fileContent) {
        const sessionName = this.droppedFileReplaceSessionName ? fileName : undefined

        if (newSession) {
          const toolConstructor = toolStore.mapOfLoadedTools[activeTool.toolId]
          const createdSession = toolSessionStore.createSession(toolConstructor, {
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
            await toolSessionStore.renameSession(activeTool.toSession(), sessionName)
          }

          /**
           * Switch to batch mode if the tool has batch fields with matching mimeType
           */
          if (!activeTool.isBatchModeEnabled && isAvailableOnBatchMode) {
            activeTool.setBatchMode(true)
          }

          activeTool.setInputValue(inputFieldKey, fileContent)
          activeTool.resetInputAndOutputFieldsState()
          activeTool.forceRerender()
        }
      }
    } catch (exception) {
      console.log("Unable to read file as text")
      toast.error("Unable to read file as text")
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
