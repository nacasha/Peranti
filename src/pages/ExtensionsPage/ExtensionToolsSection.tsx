import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { ExtensionRuntimeLabels } from "src/constants/extension-runtime-labels"
import { Icons } from "src/constants/icons"
import { ExtensionRuntime } from "src/enums/extension-runtime"

import { ExtensionFieldsList } from "./ExtensionDetails.tsx"

export interface ExtensionToolsSectionItem {
  toolId: string
  name: string
  description?: string
  runtime?: ExtensionRuntime

  /**
   * Command line or entry file, see `getExtensionToolRuns`
   */
  runs?: string

  /**
   * Its `peranti.tool.json`, relative to the extension folder
   */
  path?: string
  inputFields?: unknown
  outputFields?: unknown

  /**
   * Opens the tool, missing when it can't be opened yet
   */
  onOpen?: () => void
}

interface ExtensionToolsSectionProps {
  tools: ExtensionToolsSectionItem[]
}

/**
 * A block for each of an extension's tools, with how it runs and its inputs
 * and outputs. Content of the Tools tab.
 */
export const ExtensionToolsSection: FC<ExtensionToolsSectionProps> = ({ tools }) => {
  return (
    <div className="ExtensionTools">
      {tools.map((tool) => (
        <div key={tool.toolId} className="ExtensionTools-item">
          <div className="ExtensionTools-header">
            <div className="ExtensionTools-heading">
              <div className="ExtensionTools-title">
                <span className="ExtensionTools-name">{tool.name}</span>
                {tool.runtime && <span className="ExtensionDetails-chip">{ExtensionRuntimeLabels[tool.runtime]}</span>}
              </div>
              {tool.description && <div className="ExtensionTools-description">{tool.description}</div>}
              {tool.runs && (
                <div className="ExtensionTools-runs">
                  {tool.runtime === ExtensionRuntime.Executable ? "Runs " : "Entry "}
                  <code>{tool.runs}</code>
                </div>
              )}
              {tool.path && (
                <div className="ExtensionTools-runs">
                    Defined in <code>{tool.path}</code>
                </div>
              )}
            </div>

            {tool.onOpen && (
              <Button icon={Icons.OpenInNewTab} onClick={tool.onOpen}>Open</Button>
            )}
          </div>

          <ExtensionFieldsList inputFields={tool.inputFields} outputFields={tool.outputFields} />
        </div>
      ))}
    </div>
  )
}
