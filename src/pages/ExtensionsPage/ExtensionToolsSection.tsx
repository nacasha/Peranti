import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { ExtensionRuntimeLabels } from "src/constants/extension-runtime-labels"
import { Icons } from "src/constants/icons"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOutput } from "src/types/AppletOutput"
import { type ComponentValueInfo } from "src/types/ComponentValueInfo"
import { getFieldCountSummary } from "src/utils/applet/get-field-count-summary"
import { getFieldValueInfo } from "src/utils/component/get-field-value-info"

import { ExtensionAccordion, ExtensionAccordionMeta, ExtensionAccordionPanel } from "./ExtensionAccordion.tsx"

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

type ExtensionComponentValues = Array<{ componentId: string, value?: ComponentValueInfo }>

interface ExtensionToolsSectionProps {
  tools: ExtensionToolsSectionItem[]

  /**
   * The extension's own components, so `@<id>` fields show their type
   */
  components?: ExtensionComponentValues
}

/**
 * A row for each of an extension's tools, expanded to show how it runs and
 * its inputs and outputs side by side. Content of the Tools tab.
 */
export const ExtensionToolsSection: FC<ExtensionToolsSectionProps> = ({ tools, components }) => (
  <ExtensionAccordion
    stateKey="tools.expanded"
    label={tools.length === 1 ? "tool" : "tools"}
    items={tools.map((tool) => {
      const inputs = Array.isArray(tool.inputFields) ? tool.inputFields as AppletInput[] : []
      const outputs = Array.isArray(tool.outputFields) ? tool.outputFields as AppletOutput[] : []

      return {
        id: tool.toolId,
        kind: "tool",
        name: tool.name,
        description: tool.description,
        tags: tool.runtime && <span className="ExtensionDetails-chip">{ExtensionRuntimeLabels[tool.runtime]}</span>,
        summary: getFieldCountSummary(tool.inputFields, tool.outputFields),
        actions: tool.onOpen && <Button icon={Icons.OpenInNewTab} onClick={tool.onOpen}>Open</Button>,
        content: (
          <>
            <ExtensionAccordionMeta
              items={[
                { label: "ID", value: <code>{tool.toolId}</code> },
                { label: tool.runtime === ExtensionRuntime.Executable ? "Runs" : "Entry", value: tool.runs && <code>{tool.runs}</code> },
                { label: "File", value: tool.path && <code>{tool.path}</code> }
              ]}
            />

            <div className="ExtensionAccordion-panels">
              <ExtensionAccordionPanel title="Inputs" count={inputs.length}>
                <ToolFieldRows fields={inputs} mode="input" components={components} />
              </ExtensionAccordionPanel>
              <ExtensionAccordionPanel title="Outputs" count={outputs.length}>
                <ToolFieldRows fields={outputs} mode="output" components={components} />
              </ExtensionAccordionPanel>
            </div>
          </>
        )
      }
    })}
  />
)

interface ToolFieldRowsProps {
  fields: Array<AppletInput | AppletOutput>
  mode: "input" | "output"
  components?: ExtensionComponentValues
}

/**
 * A tool's inputs or outputs: label and key on the left, the component that
 * draws it and its value type on the right
 */
const ToolFieldRows: FC<ToolFieldRowsProps> = ({ fields, mode, components }) => {
  if (fields.length === 0) {
    return <p className="ExtensionAccordion-empty">None</p>
  }

  return (
    <ul className="ExtensionFieldRows">
      {fields.map((field) => {
        const valueInfo = getFieldValueInfo(String(field.component), mode, components)

        return (
          <li key={String(field.key)} className="ExtensionFieldRows-item">
            <div className="ExtensionFieldRows-text">
              <span className="ExtensionFieldRows-label">{field.label || String(field.key)}</span>
              <code className="ExtensionFieldRows-key">{String(field.key)}</code>
            </div>
            <div className="ExtensionFieldRows-component" title={valueInfo?.description}>
              <span className="ExtensionDetails-chip">{String(field.component)}</span>
              {valueInfo && <span className="ExtensionFieldRows-type">{ComponentValueTypeLabels[valueInfo.type]}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
