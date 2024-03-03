import { createContext } from "react"

interface AppletComponentContextValue {
  type: "input" | "output"
  fieldKey: string
}

export const AppletComponentContent = createContext<AppletComponentContextValue>({} as any)
