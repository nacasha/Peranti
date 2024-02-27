class HotkeysStore {
  private readonly defaultKeys = {
    ESCAPE: "escape",
    OPEN_COMMANDBAR: "ctrl+k, ctrl+p",
    TAB_NEW_EDITOR: "ctrl+n",
    TAB_CLOSE: "ctrl+w",
    TAB_CYCLE_NEXT: "ctrl+tab",
    TAB_CYCLE_PREV: "ctrl+shift+tab",
    RESTORE_CLOSED_TAB: "ctrl+shift+t",
    RENAME_ACTIVE_TAB: "f2",
    BOTTOM_PANEL: "ctrl+`",
    PREVIOUS_SESSION: "alt+ArrowLeft",
    NEXT_SESSION: "alt+ArrowRight"
  }

  keys = {
    ...this.defaultKeys
  }
}

export const hotkeysStore = new HotkeysStore()
