class HotkeysStore {
  keys = {
    ESCAPE: "escape",
    OPEN_SEARCH: "ctrl+k, ctrl+p",
    TAB_NEW_EDITOR: "ctrl+n",
    TAB_CLOSE: "ctrl+w",
    TAB_CYCLE_NEXT: "ctrl+tab",
    TAB_CYCLE_PREV: "ctrl+shift+tab"
  }
}

export const hotkeysStore = new HotkeysStore()
