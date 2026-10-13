import { type BuiltInComponentEntry } from "./BuiltInComponentEntry.ts"
import { type InstalledExtension } from "./InstalledExtension.ts"
import { type LoadedExtensionComponent } from "./LoadedExtensionComponent.ts"

/**
 * What the component playground shows: a component of an extension, drawn
 * in its frame, or one of the app's own
 */
export type ComponentPlaygroundTarget =
  | { type: "extension", key: string, extension: InstalledExtension, component: LoadedExtensionComponent }
  | { type: "builtin", key: string, entry: BuiltInComponentEntry }
