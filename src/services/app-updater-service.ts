import { relaunch } from "@tauri-apps/plugin-process"
import { check, type Update } from "@tauri-apps/plugin-updater"
import { makeAutoObservable, observable, runInAction } from "mobx"

import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

import { userSettingsService } from "./user-settings-service.js"

export type AppUpdaterStatus =
  | "idle"
  | "checking"
  | "upToDate"
  | "available"
  | "downloading"
  | "installed"
  | "error"

/**
 * Checks the GitHub releases for a newer version and installs it in place,
 * through the Tauri updater plugin. The release workflow publishes a
 * `latest.json` with signed bundles for every platform, which the plugin reads
 * and verifies against the public key in tauri.conf.json.
 */
class AppUpdaterService {
  /**
   * Check for a newer version each time the app starts
   */
  @userSettingsService.watch(UserSettingsKeys.updaterCheckOnStartup)
  checkOnStartup: boolean = userSettingsService.get(
    UserSettingsKeys.updaterCheckOnStartup,
    true
  )

  status: AppUpdaterStatus = "idle"

  /**
   * Newer release found by the last check
   */
  update?: Update = undefined

  /**
   * Bytes received so far and the size of the bundle, while downloading. The
   * total is unknown when the server sends no content length.
   */
  downloadedBytes: number = 0
  totalBytes?: number = undefined

  error?: string = undefined

  /**
   * Only the desktop app can install updates; the web build is always current
   */
  readonly isSupported = isRunningInTauri

  readonly currentVersion = __APP_VERSION__

  constructor() {
    // A ref, not deep: the Update is a plugin class holding a native resource
    // handle, and only swapping it for another needs to be seen
    makeAutoObservable(this, { update: observable.ref })
    userSettingsService.watchStore(this)
  }

  get isBusy() {
    return this.status === "checking" || this.status === "downloading"
  }

  get availableVersion() {
    return this.update?.version
  }

  get releaseNotes() {
    return this.update?.body
  }

  get downloadProgress() {
    if (!this.totalBytes) return undefined
    return Math.min(1, this.downloadedBytes / this.totalBytes)
  }

  setCheckOnStartup(value: boolean) {
    this.checkOnStartup = value
  }

  /**
   * Ask the release endpoint whether a newer version exists. Resolves to true
   * when one does; failures are kept in `error` rather than thrown.
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.isSupported || this.isBusy) return false

    // Already downloaded and waiting for a restart; checking again would offer
    // the same version a second time
    if (this.status === "installed") return true

    this.status = "checking"
    this.error = undefined

    try {
      const update = await check()

      runInAction(() => {
        this.update = update ?? undefined
        this.status = update ? "available" : "upToDate"
      })

      return !!update
    } catch (exception) {
      runInAction(() => {
        this.status = "error"
        this.error = getErrorMessage(exception)
      })

      return false
    }
  }

  /**
   * Download the update found by the last check and install it. The new
   * version runs after `relaunch`; on Windows the installer closes the app
   * itself.
   */
  async downloadAndInstall() {
    const { update } = this
    if (!update || this.isBusy) return

    this.status = "downloading"
    this.error = undefined
    this.downloadedBytes = 0
    this.totalBytes = undefined

    try {
      await update.downloadAndInstall((event) => {
        runInAction(() => {
          if (event.event === "Started") {
            this.totalBytes = event.data.contentLength
          } else if (event.event === "Progress") {
            this.downloadedBytes += event.data.chunkLength
          }
        })
      })

      runInAction(() => {
        this.status = "installed"
      })
    } catch (exception) {
      runInAction(() => {
        this.status = "error"
        this.error = getErrorMessage(exception)
      })
    }
  }

  async relaunch() {
    await relaunch()
  }
}

export const appUpdaterService = new AppUpdaterService()
