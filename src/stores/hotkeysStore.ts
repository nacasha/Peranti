class HotkeysStore {
  private readonly defaultKeys = {
    ESCAPE: "escape",
    OPEN_SEARCH: "ctrl+k, ctrl+p",
    TAB_NEW_EDITOR: "ctrl+n",
    TAB_CLOSE: "ctrl+w",
    TAB_CYCLE_NEXT: "ctrl+tab",
    TAB_CYCLE_PREV: "ctrl+shift+tab",
    RESTORE_CLOSED_TAB: "ctrl+shift+t",
    RENAME_ACTIVE_TAB: "f2"
  }

  keys = {
    ...this.defaultKeys
  }
}

export const hotkeysStore = new HotkeysStore()
