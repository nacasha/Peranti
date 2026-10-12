import { type FC } from "react"

import { ExtensionComponentKindLabels } from "src/constants/extension-component-kind-labels"
import { type CatalogExtensionComponent } from "src/types/CatalogExtension"

interface ExtensionComponentsSectionProps {
  components: CatalogExtensionComponent[]
}

/**
 * Field components an extension draws itself, used by its tools as `@id`.
 * Content of the Components tab.
 */
export const ExtensionComponentsSection: FC<ExtensionComponentsSectionProps> = ({ components }) => (
  <div className="ExtensionDetails-tableWrap">
    <table className="ExtensionDetails-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Use as</th>
          <th>Kind</th>
          <th>Defined in</th>
        </tr>
      </thead>
      <tbody>
        {components.map((component) => (
          <tr key={component.componentId}>
            <td>
              {component.name}
              {component.description && (
                <div className="ExtensionDetails-table-muted ExtensionDetails-table-wrap">{component.description}</div>
              )}
            </td>
            <td><code>@{component.componentId}</code></td>
            <td><span className="ExtensionDetails-chip">{ExtensionComponentKindLabels[component.kind ?? "both"]}</span></td>
            <td className="ExtensionDetails-table-muted"><code>{component.path}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
