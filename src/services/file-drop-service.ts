import { makeAutoObservable, runInAction } from "mobx"
import toast from "react-hot-toast"

import { FileDropAction } from "src/enums/file-drop-action.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { type AppletComponent } from "src/models/AppletComponent.js"
import { appletComponentService } from "src/services/applet-component-service.js"
import { type FileDropZone } from "src/types/FileDropZone.js"
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

  /** Bumped on every drop, so late stat results can tell they are stale. */
  private dropToken = 0

  /**
   * Name / extension / size for each dropped path, in the same order as
   * `droppedFilePaths`. Sizes are filled in asynchronously, so the overlay can
   * render immediately and let the size fade in once the stat resolves.
   */
  droppedFileDetails: DroppedFileInfo[] = []

  isHoveringFile: boolean = false

  isDroppingFile: boolean = false

  /**
   * Drop zone under the cursor while dragging, and the one the files landed on
   * once dropped. Undefined when the cursor is over nothing that takes files.
   */
  hoveredZone: FileDropZone | undefined = undefined

  constructor() {
    makeAutoObservable(this)
    userSettingsService.watchStore(this)
  }

  setIsHovering(value: boolean) {
    this.isHoveringFile = value
  }

  /**
   * "over" events fire continuously, so an unchanged zone must not replace the
   * stored object or every subscriber would re-render on each mouse move.
   */
  setHoveredZone(zone: FileDropZone | undefined) {
    if (this.hoveredZone?.type === zone?.type && this.hoveredZone?.id === zone?.id) {
      return
    }

    this.hoveredZone = zone
  }

  setDroppedFilePaths(filePaths: string[]) {
    this.dropToken++
    this.droppedFilePaths = filePaths
    this.droppedFileDetails = filePaths.map((path) => ({
      path,
      name: getFileNameFromPath(path),
      extension: getFileExtension(path),
      directory: getDirectoryFromPath(path)
    }))

    void this.loadDroppedFileSizes(filePaths, this.dropToken)
  }

  /**
   * Fills in sizes for the paths of one drop. Bails out if a newer drop
   * replaced it while the stats were resolving, so a slow drag can't overwrite
   * the details of a newer one. Matched by path, because files may have been
   * removed from the list in the meantime.
   */
  private async loadDroppedFileSizes(filePaths: string[], token: number) {
    const stats = await Promise.all(filePaths.map(async(path) => await fileService.statFile(path)))

    runInAction(() => {
      if (this.dropToken !== token) {
        return
      }

      this.droppedFileDetails = this.droppedFileDetails.map((detail) => {
        const stat = stats[filePaths.indexOf(detail.path)]

        return { ...detail, size: stat?.size, isDirectory: stat?.isDirectory }
      })
    })
  }

  /**
   * Takes files out of the dropped list, e.g. after they were opened or when
   * the user dismisses one. The drop ends once nothing is left.
   */
  removeDroppedFiles(filePaths: string[]) {
    this.droppedFilePaths = this.droppedFilePaths.filter((path) => !filePaths.includes(path))
    this.droppedFileDetails = this.droppedFileDetails.filter((detail) => !filePaths.includes(detail.path))

    if (this.droppedFilePaths.length === 0) {
      this.resetState()
    }
  }

  setIsDroppingFile(value: boolean) {
    this.isDroppingFile = value
  }

  resetState() {
    this.isHoveringFile = false
    this.isDroppingFile = false
    this.droppedFilePaths = []
    this.droppedFileDetails = []
    this.hoveredZone = undefined
  }

  /**
   * Writes the dropped file(s) into one specific input of the active tool,
   * leaving every other input untouched. Inputs reading as "files" take every
   * dropped file, the others only the first.
   */
  async dropOnField(fieldKey: string) {
    const activeApplet = activeAppletStore.getActiveApplet()
    const inputField = activeApplet.getInputFields().find((field) => field.key === fieldKey)

    if (!inputField || this.droppedFilePaths.length === 0) {
      this.resetState()
      return
    }

    const inputComponent = appletComponentService.getInputComponent(
      inputField.component,
      activeApplet.isBatchModeEnabled
    )
    const filePaths = [...this.droppedFilePaths]
    const fileName = getFileNameFromPath(filePaths[0])

    try {
      const fileContent = await appletComponentService.readFilesFromComponent(inputComponent, filePaths)

      if (fileContent !== undefined) {
        if (this.droppedFileReplaceSessionName) {
          await sessionStore.renameSession(activeApplet.toSession(), fileName)
        }

        activeApplet.setInputValue(fieldKey, fileContent)
        activeApplet.resetInputAndOutputFieldsState()

        if (filePaths.length > 1 && inputComponent.readFileAs !== "files") {
          toast(`${inputField.label} takes one file, used ${fileName}`)
        }
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} file as text`)
    }

    this.resetState()
  }

  /**
   * Groups the dropped paths by how they will be read: an input reading as
   * "files" takes every path at once, other inputs take one path per session.
   */
  private getDroppedPathGroups(component?: AppletComponent, filePaths: string[] = this.droppedFilePaths) {
    if (component?.readFileAs === "files") {
      return [[...filePaths]]
    }

    return filePaths.map((filePath) => [filePath])
  }

  private getActiveAppletFileComponent() {
    const activeApplet = activeAppletStore.getActiveApplet()

    if (activeApplet.appletId === "") {
      return
    }

    const [inputFields, isAvailableOnBatchMode] = activeApplet.getInputFieldsWithReadableFile()

    if (inputFields.length === 0) {
      return
    }

    return appletComponentService.getInputComponent(inputFields[0].component, isAvailableOnBatchMode)
  }

  async readFileAndOpenSession(filePaths: string[], newSession: boolean = false) {
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
    const fileName = getFileNameFromPath(filePaths[0])

    try {
      const fileContent = await appletComponentService.readFilesFromComponent(inputComponent, filePaths)

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
   * Opens dropped files (all of them unless `filePaths` narrows it down) in a new
   * session of the chosen applet, which is not necessarily the active one —
   * this is what the tool picker in the drop panel calls. The opened files
   * leave the list, so the rest can still go to other tools.
   */
  async openInNewSessionOfApplet(appletId: string, filePaths: string[] = [...this.droppedFilePaths]) {
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
    const pathGroups = this.getDroppedPathGroups(inputComponent, filePaths)

    for (const groupPaths of pathGroups) {
      const fileName = getFileNameFromPath(groupPaths[0])

      try {
        const fileContent = await appletComponentService.readFilesFromComponent(inputComponent, groupPaths)

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

    this.removeDroppedFiles(filePaths)
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
    const pathGroups = this.getDroppedPathGroups(this.getActiveAppletFileComponent())

    for (const filePaths of pathGroups) {
      await this.readFileAndOpenSession(filePaths)
    }

    this.resetState()
  }

  async replaceCurrentSessionAndOpenNew() {
    const pathGroups = this.getDroppedPathGroups(this.getActiveAppletFileComponent())

    for (let index = 0; index < pathGroups.length; index++) {
      await this.readFileAndOpenSession(pathGroups[index], index > 0)
    }

    this.resetState()
  }

  async openInNewSession() {
    const pathGroups = this.getDroppedPathGroups(this.getActiveAppletFileComponent())

    for (const filePaths of pathGroups) {
      await this.readFileAndOpenSession(filePaths, true)
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
