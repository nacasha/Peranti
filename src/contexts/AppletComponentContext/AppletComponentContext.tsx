import { createContext } from "react"

import { type AppletComponent } from "src/models/AppletComponent"
import { type FieldAction } from "src/types/FieldAction"

interface AppletComponentContextValue {
  type: "input" | "output"
  fieldKey: string
  component?: AppletComponent
  showRegenerateButton?: boolean
  showBatchModeButton?: boolean
  actions?: FieldAction[]
}

export const AppletComponentContext = createContext<AppletComponentContextValue>({} as any)
