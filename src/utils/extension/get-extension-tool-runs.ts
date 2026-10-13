import { ExtensionRuntime } from "src/enums/extension-runtime"
import { type ExtensionTool } from "src/types/ExtensionTool"

/**
 * What a tool runs, for display: the command line of an executable tool, or
 * the entry file of a JavaScript one
 */
export function getExtensionToolRuns(tool: ExtensionTool): string | undefined {
  if (tool.runtime === ExtensionRuntime.Executable) {
    return [tool.executable?.command, ...(tool.executable?.args ?? [])].filter(Boolean).join(" ") || undefined
  }

  return tool.javascript?.entry
}
