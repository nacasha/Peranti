import { makeAutoObservable, runInAction } from "mobx"
import toast from "react-hot-toast"

import { FileDropAction } from "src/enums/file-drop-action.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { appletComponentService } from "src/services/applet-component-service.js"
import { getDirectoryFromPath } from "src/utils/get-directory-from-path.js"
import { getFileExtension } from "src/utils/get-file-extension.js"
import { getFileNameFromPath } from "src/utils/get-file-name-from-path.js"

import { activeAppletStore } from "./active-applet-store.js"
import { appletFileSupportService } from "./applet-file-support-service.js"
import { appletStore } from "./applet-store.js"
import { fileService } from "./file-service.js"
import { sessionStore } from "./session-store.js"
import { userSettingsService } from "./user-settings-service.js"

export interface DroppedFileInfo {
  path: string
  name: string
  extension: string
  directory: string
  /** Undefined while the stat call is still in flight, or when it failed. */
  size?: number
  isDirectory?: boolean
}

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

  /**
   * Name / extension / size for each dropped path, in the same order as
   * `droppedFilePaths`. Sizes are filled in asynchronously, so the overlay can
   * render immediately and let the size fade in once the stat resolves.
   */
  droppedFileDetails: DroppedFileInfo[] = []

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
    this.droppedFileDetails = filePaths.map((path) => ({
      path,
      name: getFileNameFromPath(path),
      extension: getFileExtension(path),
      directory: getDirectoryFromPath(path)
    }))

    void this.loadDroppedFileSizes(filePaths)
  }

  /**
   * Fills in sizes for the currently dropped paths. Bails out if the selection
   * changed while the stats were resolving, so a slow drag can't overwrite the
   * details of a newer one.
   */
  private async loadDroppedFileSizes(filePaths: string[]) {
    const stats = await Promise.all(filePaths.map(async(path) => await fileService.statFile(path)))

    runInAction(() => {
      if (this.droppedFilePaths !== filePaths) {
        return
      }

      this.droppedFileDetails = this.droppedFileDetails.map((detail, index) => ({
        ...detail,
        size: stats[index]?.size,
        isDirectory: stats[index]?.isDirectory
      }))
    })
  }

  setIsDroppingFile(value: boolean) {
    this.isDroppingFile = value
  }

  resetState() {
    this.isHoveringFile = false
    this.isDroppingFile = false
    this.droppedFilePaths = []
    this.droppedFileDetails = []
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

  /**
   * Opens every dropped file in a new session of the chosen applet, which is not
   * necessarily the active one — this is what the tool picker in the drop
   * overlay calls.
   */
  async openInNewSessionOfApplet(appletId: string) {
    const appletConstructor = appletStore.mapOfLoadedApplets[appletId]

    if (!appletConstructor) {
      this.resetState()
      return
    }

    const target = appletFileSupportService.getFileTarget(appletConstructor)

    if (!target) {
      toast.error(`${appletConstructor.name} does not support file drop`)
      this.resetState()
      return
    }

    const inputComponent = appletComponentService.getInputComponent(target.component, target.isBatch)
    const filePaths = [...this.droppedFilePaths]

    for (const filePath of filePaths) {
      const fileName = getFileNameFromPath(filePath)

      try {
        const fileContent = await appletComponentService.readFileFromComponent(inputComponent, filePath)

        if (fileContent === undefined) {
          continue
        }

        const createdSession = sessionStore.createSession(appletConstructor, {
          initialState: {
            sessionName: this.droppedFileReplaceSessionName ? fileName : undefined,
            inputValues: { [target.inputFieldKey]: fileContent }
          }
        })

        if (target.isBatch && createdSession) {
          createdSession.setBatchMode(true)
        }
      } catch (exception) {
        toast.error(`Unable to read ${fileName} file as text`)
      }
    }

    this.resetState()
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
