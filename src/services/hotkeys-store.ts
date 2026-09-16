class HotkeysStore {
  /**
   * "mod" is resolved by react-hotkeys-hook to Meta (⌘) on macOS and Ctrl on
   * every other platform, so these defaults follow each platform's convention.
   * Shortcuts that are Ctrl-based on macOS as well (tab cycling, panel toggle)
   * intentionally stay on "ctrl".
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
    BOTTOM_PANEL: "ctrl+`",
    PREVIOUS_SESSION: "alt+ArrowLeft",
    NEXT_SESSION: "alt+ArrowRight",
    OPEN_SETTINGS: "mod+,"
  }

  keys = {
    ...this.defaultKeys
  }
}

export const hotkeysStore = new HotkeysStore()
