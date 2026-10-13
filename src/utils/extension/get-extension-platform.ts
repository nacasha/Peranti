import { ExtensionPlatform } from "src/enums/extension-platform"
import { ExtensionRuntime } from "src/enums/extension-runtime"

/**
 * Where an extension with tools of these runtimes can run: the browser too
 * unless one of them runs a program. Undefined without tools, such as an
 * extension that failed to load.
 */
export function getExtensionPlatform(runtimes: Array<ExtensionRuntime | undefined>): ExtensionPlatform | undefined {
  if (runtimes.length === 0) {
    return undefined
  }

  return runtimes.includes(ExtensionRuntime.Executable) ? ExtensionPlatform.Desktop : ExtensionPlatform.Web
}
