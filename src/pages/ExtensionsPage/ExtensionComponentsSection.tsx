import { clsx } from "clsx"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { ExtensionComponentKindLabels } from "src/constants/extension-component-kind-labels"
import { Icons } from "src/constants/icons"
import { type CatalogExtensionComponent } from "src/types/CatalogExtension"
import { formatJson } from "src/utils/data/format-json"

import { ComponentFieldsTable } from "./ComponentFieldsTable.tsx"
import { ExtensionAccordion, ExtensionAccordionMeta, ExtensionAccordionPanel } from "./ExtensionAccordion.tsx"

export interface ExtensionComponentsSectionItem extends CatalogExtensionComponent {
  /**
   * Opens it in the playground, missing when it isn't loaded
   */
  onOpen?: () => void
}

interface ExtensionComponentsSectionProps {
  components: ExtensionComponentsSectionItem[]
}

/**
 * A row for each component an extension draws itself, expanded to show its
 * value and props. Content of the Components tab.
 */
export const ExtensionComponentsSection: FC<ExtensionComponentsSectionProps> = ({ components }) => (
  <ExtensionAccordion
    stateKey="components.expanded"
    label={components.length === 1 ? "component" : "components"}
    items={components.map((component) => {
      const kind = component.kind ?? "both"
      const valueType = component.value?.type ?? "any"
      const propsCount = component.props?.length ?? 0

      return {
        id: component.componentId,
        kind: "component",
        name: component.name,
        description: component.description,
        // Which side it draws, its value type is in the summary
        tags: <span className={clsx("ExtensionComponents-kind", `is-${kind}`)}>{ExtensionComponentKindLabels[kind]}</span>,
        summary: `${ComponentValueTypeLabels[valueType]} value · ${propsCount} prop${propsCount === 1 ? "" : "s"}`,
        actions: component.onOpen && (
          <Button icon={Icons.OpenInNewTab} onClick={component.onOpen}>Playground</Button>
        ),
        content: (
          <>
            <ExtensionAccordionMeta
              items={[
                { label: "ID", value: <code>@{component.componentId}</code> },
                { label: "Entry", value: component.entry && <code>{component.entry}</code> },
                { label: "File", value: component.path && <code>{component.path}</code> }
              ]}
            />

            <div className="ExtensionAccordion-panels">
              <ExtensionAccordionPanel title="Value" isWide>
                <div className="ExtensionComponents-value">
                  <div className="ExtensionComponents-value-type">
                    <code>{ComponentValueTypeLabels[valueType]}</code>
                    {component.value?.description && <span>{component.value.description}</span>}
                    {!component.value && <span>Not documented, any JSON can be passed</span>}
                  </div>
                  {component.value?.type === "array" && component.value.itemType && !component.value.fields && (
                    <div className="ExtensionDetails-table-muted">
                      A list of {ComponentValueTypeLabels[component.value.itemType]} items
                    </div>
                  )}
                  {component.value?.fields && component.value.fields.length > 0 && (
                    <>
                      <div className="ExtensionDetails-table-muted">
                        {component.value.type === "array" ? "Each item is an object with these keys" : "Keys"}
                      </div>
                      <ComponentFieldsTable fields={component.value.fields} />
                    </>
                  )}
                  {component.value?.example !== undefined && (
                    <pre className="ExtensionComponents-example">{formatJson(component.value.example)}</pre>
                  )}
                </div>
              </ExtensionAccordionPanel>

              <ExtensionAccordionPanel title="Props" count={propsCount} isWide>
                {component.props && component.props.length > 0
                  ? <ComponentFieldsTable fields={component.props} />
                  : <p className="ExtensionAccordion-empty">None documented</p>}
              </ExtensionAccordionPanel>
            </div>
          </>
        )
      }
    })}
  />
)
