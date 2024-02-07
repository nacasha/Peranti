import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { Tool } from "src/models/Tool.ts"

class ActiveSessionStore {
  private _activeSession?: Tool = undefined

  constructor() {
    makeAutoObservable(this)

    this.setupPersistence()
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.ActiveSessionStore,
      storage: localforage,
      stringify: false,
      properties: []
    })
  }

  get toolHasBatchOutput() {
    return this.getActiveTool().getInputFields().some((output) => output.allowBatch)
  }

  setActiveTool(tool: Tool) {
    this._activeSession = tool
  }

  getActiveTool() {
    const activeTool = this._activeSession

    if (activeTool) {
      return activeTool
    }

    return Tool.empty()
  }

  isSessionActiveById(sessionId: string) {
    return this.getActiveTool().sessionId === sessionId
  }

  runActiveTool() {
    void this.getActiveTool().run()
  }

  toggleBatchMode() {
    const enabled = !this.getActiveTool().isBatchModeEnabled
    this.getActiveTool().setBatchMode(enabled)
  }

  cleanActiveSessionState() {
    const activeTool = this.getActiveTool()

    activeTool.resetInputAndOutputValues()
    activeTool.forceRerender()
  }

  fillInputValuesWithSample() {
    const activeTool = this.getActiveTool()
    const { samples } = activeTool

    if (samples.length > 0) {
      const sampleIndex = activeTool.sampleIndex
      const sample = samples[sampleIndex]

      if (typeof sample === "function") {
        activeTool.setInputValues(sample())
      } else {
        activeTool.setInputValues(sample)
      }

      const newSampleIndex = sampleIndex + 1
      activeTool.setSampleIndex(newSampleIndex > (samples.length - 1) ? 0 : newSampleIndex)
      activeTool.forceRerender()
    }
  }
}

export const activeSessionStore = new ActiveSessionStore()
