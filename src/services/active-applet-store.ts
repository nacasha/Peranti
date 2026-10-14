import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { type PopoverConfirmation } from "src/components/common/PopoverConfirm"
import { StorageKeys } from "src/constants/storage-keys"
import { Applet } from "src/models/Applet"

class ActiveAppletStore {
  private _activeApplet?: Applet = undefined

  constructor() {
    makeAutoObservable(this)

    this.setupPersistence()
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.ActiveAppletStore,
      storage: localforage,
      stringify: false,
      properties: []
    })
  }

  get hasBatchMode() {
    return this.getActiveApplet().getInputFields().some((output) => output.allowBatch)
  }

  setActiveApplet(applet: Applet) {
    this._activeApplet = applet
  }

  getActiveApplet() {
    const activeApplet = this._activeApplet

    if (activeApplet) {
      return activeApplet
    }

    return Applet.empty()
  }

  isAppletActiveBySessionId(sessionId: string) {
    return this.getActiveApplet().sessionId === sessionId
  }

  toggleBatchMode() {
    this.setBatchMode(!this.getActiveApplet().isBatchModeEnabled)
  }

  /**
   * Turning batch mode off keeps only the first line of the batch input
   */
  setBatchMode(enabled: boolean) {
    const applet = this.getActiveApplet()

    if (!enabled && applet.isBatchModeEnabled) {
      const lines = this.getBatchInputLines()
      if (lines.length > 1) {
        applet.setInputValue(applet.batchModeInputKey, lines[0])
      }
    }

    applet.setBatchMode(enabled)
  }

  /**
   * Confirmation to show before toggling batch mode, `undefined` when nothing
   * would be lost. Turning it off drops every line except the first
   */
  getToggleBatchModeConfirmation(): PopoverConfirmation | undefined {
    const hasMultipleLines = this.getBatchInputLines().length > 1

    if (!this.getActiveApplet().isBatchModeEnabled || !hasMultipleLines) {
      return undefined
    }

    return {
      title: "Disable Batch Mode",
      description: "Only the first line of the input is kept, the other lines will be lost",
      confirmLabel: "Disable",
      variant: "danger"
    }
  }

  private getBatchInputLines() {
    const applet = this.getActiveApplet()
    const batchInput = `${applet.inputValues[applet.batchModeInputKey] ?? ""}`

    return batchInput.replace(/\n+$/, "").split("\n")
  }

  cleanState() {
    const activeApplet = this.getActiveApplet()

    activeApplet.resetInputAndOutputValues()
  }
}

export const activeAppletStore = new ActiveAppletStore()
