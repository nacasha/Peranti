import { mapValuesKey } from "@udecode/zustood"

import uiStore from "./ui-store"

// Global store
export const rootStore = {
  ui: uiStore
}

// Global hook selectors
export const useStore = () => mapValuesKey("use", rootStore)

// Global getter selectors
export const store = mapValuesKey("get", rootStore)

// Global actions
export const actions = mapValuesKey("set", rootStore)
