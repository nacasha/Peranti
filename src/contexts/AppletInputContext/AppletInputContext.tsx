import { createContext } from "react"

import { type AppletComponent } from "src/models/AppletComponent"

interface AppletComponentContextValue {
  type: "input" | "output"
  fieldKey: string
  component?: AppletComponent
  showRegenerateButton?: boolean
}

export const AppletComponentContext = createContext<AppletComponentContextValue>({} as any)
