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

  get hasBatchOutput() {
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

  fillInputValuesWithSample() {
    const activeApplet = this.getActiveApplet()
    const { samples } = activeApplet

    if (samples.length > 0) {
      const sampleIndex = activeApplet.sampleIndex
      const sample = samples[sampleIndex]
      const defaultInputValues = activeApplet.getInputValuesWithDefault()

      if (typeof sample === "function") {
        activeApplet.setInputValues({ ...defaultInputValues, ...sample() })
      } else {
        activeApplet.setInputValues({ ...defaultInputValues, ...sample })
      }

      const newSampleIndex = sampleIndex + 1
      activeApplet.setSampleIndex(newSampleIndex > (samples.length - 1) ? 0 : newSampleIndex)
      activeApplet.forceRerender()

      if (!activeApplet.autoRun) {
        void activeApplet.run()
      }
    }
  }

  run() {
    void this.getActiveApplet().run()
  }
}

export const activeAppletStore = new ActiveAppletStore()
