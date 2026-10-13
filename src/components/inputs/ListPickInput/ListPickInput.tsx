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

  /**
   * Which items the value lists, as a JSON array of item indexes:
   * - "include" (default): the ticked ones, so items added later start unticked
   * - "exclude": the unticked ones, so items added to the source later start
   *   ticked
   */
  selection?: "exclude" | "include"
}

/**
 * Tick items that come from another input
 */
export const ListPickInput: FC<ListPickInputProps> = (props) => {
  const { label, fieldKey, value, readOnly, items = [], selection = "include", onValueChange } = props
  const isInclude = selection === "include"
  const listed = useMemo(() => new Set(parseOrder(value)), [value])

  const isTicked = (index: number) => listed.has(index) === isInclude

  const handleChange = (index: number, checked: boolean) => {
    const next = new Set(listed)
    // Listed means ticked when including, unticked when excluding
    if (checked === isInclude) {
      next.add(index)
    } else {
      next.delete(index)
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
              value={isTicked(index)}
              onChange={(checked) => { handleChange(index, checked) }}
              readOnly={readOnly}
              disabled={readOnly}
              label={item}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
