import { createContext } from "react"

interface AppletComponentContextValue {
  type: "input" | "output"
  fieldKey: string
}

export const AppletComponentContext = createContext<AppletComponentContextValue>({} as any)
