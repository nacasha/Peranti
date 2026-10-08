import { isMacOS } from "src/utils/get-os"

class HotkeysStore {
  /**
   * "mod" is resolved by react-hotkeys-hook to Meta (⌘) on macOS and Ctrl on
   * every other platform, so these defaults follow each platform's convention.
   * Shortcuts that are Ctrl-based on macOS as well (tab cycling) intentionally
   * stay on "ctrl".
   *
   * Previous/next session follow the browser's tab switching: ⌘⌥←/⌘⌥→ on macOS
   * (plain ⌥← / ⌥→ is word navigation in text fields), Ctrl+PageUp/PageDown elsewhere.
   */
  private readonly defaultKeys = {
    ESCAPE: "escape",
    OPEN_COMMANDBAR: "mod+k || mod+p",
    TAB_NEW_EDITOR: "mod+n || mod+t",
    TAB_CLOSE: "mod+w",
    TAB_CYCLE_NEXT: "ctrl+tab",
    TAB_CYCLE_PREV: "ctrl+shift+tab",
    RESTORE_CLOSED_TAB: "mod+shift+t",
    RENAME_ACTIVE_TAB: "f2",
    PREVIOUS_SESSION: isMacOS ? "mod+alt+ArrowLeft" : "ctrl+PageUp",
    NEXT_SESSION: isMacOS ? "mod+alt+ArrowRight" : "ctrl+PageDown",
    OPEN_SETTINGS: "mod+,"
  }

  keys = {
    ...this.defaultKeys
  }
}

export const hotkeysStore = new HotkeysStore()
