import { type FC } from "react"

import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { type ComponentPropInfo } from "src/types/ComponentPropInfo"

interface ComponentFieldsTableProps {
  fields: ComponentPropInfo[]
}

/**
 * Documented names in a table, each with its type, default, description and
 * allowed values: a component's props, or the keys of its value
 */
export const ComponentFieldsTable: FC<ComponentFieldsTableProps> = ({ fields }) => (
  <div className="ComponentFields">
    <table className="ComponentFields-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => (
          <tr key={field.name}>
            <td>
              <code className="ComponentFields-name">{field.name}</code>
              {field.required && <span className="ComponentFields-required" title="Required">*</span>}
            </td>
            <td>
              <span className="ComponentFields-type">{ComponentValueTypeLabels[field.type]}</span>
            </td>
            <td>
              {field.default !== undefined
                ? <code className="ComponentFields-default">{JSON.stringify(field.default)}</code>
                : <span className="ComponentFields-muted">—</span>}
            </td>
            <td className="ComponentFields-descriptionCell">
              {field.description ?? (!field.options && <span className="ComponentFields-muted">—</span>)}
              {field.options && (
                <div className="ComponentFields-options">
                  <span>One of</span>
                  {field.options.map((option) => (
                    <code key={JSON.stringify(option)}>{JSON.stringify(option)}</code>
                  ))}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
