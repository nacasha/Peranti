import { type FC, useMemo } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { parseOrder } from "src/components/inputs/ListReorderInput"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./ListPickInput.scss"

interface ListPickInputProps extends InputComponentProps {
  /**
   * Item labels, set in `props` or `computedProps`
   */
  items?: string[]
}

/**
 * Tick items that come from another input.
 * The value is the unticked items as a JSON array of item indexes,
 * so items added to the source later start ticked.
 */
export const ListPickInput: FC<ListPickInputProps> = (props) => {
  const { label, fieldKey, value, readOnly, items = [], onValueChange } = props
  const excluded = useMemo(() => new Set(parseOrder(value)), [value])

  const handleChange = (index: number, checked: boolean) => {
    const next = new Set(excluded)
    if (checked) {
      next.delete(index)
    } else {
      next.add(index)
    }
    onValueChange(JSON.stringify([...next].sort((a, b) => a - b)))
  }

  return (
    <div className="ListPickInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <ul className="ListPickInput-list">
        {items.length === 0 && <li className="ListPickInput-empty">No items</li>}
        {items.map((item, index) => (
          <li key={index} className="ListPickInput-item">
            <Checkbox
              value={!excluded.has(index)}
              onChange={(checked) => { handleChange(index, checked) }}
              readOnly={readOnly}
              disabled={readOnly}
              label={item}
            />
            <span className="ListPickInput-position">{index + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
