import { when } from "mobx"
import { isHydrated } from "mobx-persist-store"

import { bottomPanelService } from "src/services/bottom-panel-service"
import { extensionComponentHeightStore } from "src/services/extension-component-height-store"
import { interfaceStore } from "src/services/interface-store"
import { secondarySidebarService } from "src/services/secondary-sidebar-service"
import { sessionStore } from "src/services/session-store"

/**
 * Longest the first paint waits for restored state, so a store that never
 * finishes hydrating can't leave the window blank
 */
const RESTORE_TIMEOUT = 3000

/**
 * Resolve once every store persisted in IndexedDB has been hydrated and the
 * last active tab is open again. Rendering before that paints the default
 * layout (sidebar widths, inspector, home page) for a frame or two before it
 * jumps to the restored one.
 */
export async function waitForRestoredState() {
  const persistedStores = [
    interfaceStore,
    secondarySidebarService,
    bottomPanelService,
    extensionComponentHeightStore
  ]

  const isRestored = () => (
    persistedStores.every((store) => isHydrated(store)) &&
    sessionStore.isInitialized
  )

  await when(isRestored, { timeout: RESTORE_TIMEOUT })
    .catch(() => {
      console.warn("Restoring the previous interface state timed out, rendering with defaults")
    })
}
