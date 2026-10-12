import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { ExtensionComponentKindLabels } from "src/constants/extension-component-kind-labels"
import { Icons } from "src/constants/icons"
import { type ExtensionComponentKind } from "src/types/ExtensionComponent"

import { ExtensionDetailsSection } from "./ExtensionDetails.tsx"

interface ExtensionProvidesSectionProps {
  tools: Array<{ toolId: string, name: string, description?: string, onOpen?: () => void }>
  components: Array<{ componentId: string, name: string, kind?: ExtensionComponentKind }>
}

/**
 * Names of what an extension provides, in Overview. Their details are in the
 * Tools and Components tabs.
 */
export const ExtensionProvidesSection: FC<ExtensionProvidesSectionProps> = ({ tools, components }) => {
  if (tools.length === 0 && components.length === 0) {
    return null
  }

  return (
    <ExtensionDetailsSection title="Provides">
      <ul className="ExtensionProvides">
        {tools.map((tool) => (
          <li key={`tool:${tool.toolId}`} className="ExtensionProvides-item">
            <Icons.Extension size={14} aria-hidden className="ExtensionProvides-icon" />
            <div className="ExtensionProvides-text">
              <span className="ExtensionProvides-name">{tool.name}</span>
              {tool.description && <span className="ExtensionProvides-description">{tool.description}</span>}
            </div>
            <span className="ExtensionDetails-chip">Tool</span>
            {tool.onOpen && (
              <Button icon={Icons.OpenInNewTab} onClick={tool.onOpen}>Open</Button>
            )}
          </li>
        ))}

        {components.map((component) => (
          <li key={`component:${component.componentId}`} className="ExtensionProvides-item">
            <Icons.Browse size={14} aria-hidden className="ExtensionProvides-icon" />
            <div className="ExtensionProvides-text">
              <span className="ExtensionProvides-name">{component.name}</span>
              <code className="ExtensionProvides-description">@{component.componentId}</code>
            </div>
            <span className="ExtensionDetails-chip">
              {ExtensionComponentKindLabels[component.kind ?? "both"]} Component
            </span>
          </li>
        ))}
      </ul>
    </ExtensionDetailsSection>
  )
}
