import { type AppletComponent } from "src/models/AppletComponent"

import { type ExtensionComponentKind } from "./ExtensionComponent.ts"

/**
 * A field component of the app itself, by the name tools use for it. Some
 * names are both an input and an output, drawn by two different components.
 */
export interface BuiltInComponentEntry {
  name: string
  kind: ExtensionComponentKind
  input?: AppletComponent
  output?: AppletComponent
}
