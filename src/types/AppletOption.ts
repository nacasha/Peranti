import { type AppletInput } from "./AppletInput.js"

export type AppletOption<
  K extends Record<string, string> | any = any
> = Omit<AppletInput<K>, "allowBatch" | "skipValidateHasValue">
