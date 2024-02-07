import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { Tool } from "src/models/Tool.ts"

class ActiveSessionStore {
  /**
   * Store active tool that currently used
   */
  private _activeSession?: Tool = undefined

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)

    this.setupPersistence()
  }

  /**
   * Setup store persistence
   */
  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.ActiveSessionStore,
      storage: localforage,
      stringify: false,
      properties: []
    })
  }

  /**
   * Determine whether current active tool has batch operations
   */
  get toolHasBatchOutput() {
    return this.getActiveTool().getInputFields().some((output) => output.allowBatch)
  }

  /**
   * Set active tool
   *
   * @param tool
   */
  setActiveTool(tool: Tool) {
    this._activeSession = tool
  }

  /**
   * Get current active tool, or return empty if there is no active tool
   *
   * @returns Tool
   */
  getActiveTool() {
    const activeTool = this._activeSession

    if (activeTool) {
      return activeTool
    }

    return Tool.empty()
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isSessionActiveById(sessionId: string) {
    return this.getActiveTool().sessionId === sessionId
  }

  /**
   * Run active tool and save to history
   */
  runActiveTool() {
    void this.getActiveTool().run()
  }

  /**
   * Toggle enable and disable batch mode
   */
  toggleBatchMode() {
    const enabled = !this.getActiveTool().isBatchModeEnabled
    this.getActiveTool().setBatchMode(enabled)
  }

  /**
   * Clean current active tool editor input and output state
   */
  cleanActiveSessionState() {
    const activeTool = this.getActiveTool()

    activeTool.resetInputAndOutputValues()
    activeTool.forceRerender()
  }

  /**
   * Fill current input tool with sample data
   */
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
