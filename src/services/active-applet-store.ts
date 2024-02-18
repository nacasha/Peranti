import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

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
    const enabled = !this.getActiveApplet().isBatchModeEnabled
    this.getActiveApplet().setBatchMode(enabled)
  }

  cleanState() {
    const activeApplet = this.getActiveApplet()

    activeApplet.resetInputAndOutputValues()
    activeApplet.forceRerender()
  }

  run() {
    void this.getActiveApplet().run()
  }
}

export const activeAppletStore = new ActiveAppletStore()
