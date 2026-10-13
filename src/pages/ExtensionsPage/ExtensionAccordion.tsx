import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { usePageState } from "src/hooks/usePageState"

export interface ExtensionAccordionItem {
  id: string
  kind: "tool" | "component"
  name: string

  /**
   * Beside the name, such as chips or an id
   */
  tags?: ReactNode
  description?: string

  /**
   * Muted text at the end of the row, such as "2 inputs · 1 output"
   */
  summary?: ReactNode

  /**
   * Buttons at the end of the row, kept out of the toggle
   */
  actions?: ReactNode

  /**
   * Shown when the row is expanded
   */
  content: ReactNode
}

interface ExtensionAccordionProps {
  /**
   * Page state key that keeps which rows are expanded
   */
  stateKey: string
  label: string
  items: ExtensionAccordionItem[]
}

/**
 * A compact row for each tool or component, expanded one by one to show its
 * details. Content of the Tools and Components tabs.
 */
export const ExtensionAccordion: FC<ExtensionAccordionProps> = ({ stateKey, label, items }) => {
  // A lone item has nothing to scan past, so it starts open
  const [expandedIds, setExpandedIds] = usePageState<string[]>(stateKey, () => (items.length === 1 ? [items[0].id] : []))
  const isAllExpanded = items.every((item) => expandedIds.includes(item.id))

  const toggle = (id: string) => {
    setExpandedIds(expandedIds.includes(id)
      ? expandedIds.filter((expandedId) => expandedId !== id)
      : [...expandedIds, id])
  }

  const toggleAll = () => {
    setExpandedIds(isAllExpanded ? [] : items.map((item) => item.id))
  }

  return (
    <div className="ExtensionAccordion">
      <div className="ExtensionAccordion-toolbar">
        <span className="ExtensionAccordion-count">{items.length} {label}</span>
        {items.length > 1 && (
          <ButtonIcon
            icon={isAllExpanded ? Icons.CollapseAll : Icons.ExpandAll}
            tooltip={isAllExpanded ? "Collapse All" : "Expand All"}
            onClick={toggleAll}
          />
        )}
      </div>

      <ul className="ExtensionAccordion-list">
        {items.map((item) => {
          const isExpanded = expandedIds.includes(item.id)
          const ItemIcon = item.kind === "tool" ? Icons.Tool : Icons.Extension

          return (
            <li key={item.id} className={clsx("ExtensionAccordion-item", isExpanded && "is-expanded")}>
              <div className="ExtensionAccordion-row">
                <button
                  type="button"
                  className="ExtensionAccordion-toggle"
                  aria-expanded={isExpanded}
                  onClick={() => { toggle(item.id) }}
                >
                  <Icons.ChevronRight className="ExtensionAccordion-chevron" size={14} aria-hidden />
                  <span className={clsx("ExtensionIconBadge", `is-${item.kind}`)} aria-hidden>
                    <ItemIcon size={15} />
                  </span>
                  <span className="ExtensionAccordion-text">
                    <span className="ExtensionAccordion-title">
                      <span className="ExtensionAccordion-name">{item.name}</span>
                      {item.tags}
                    </span>
                    {item.description && <span className="ExtensionAccordion-description">{item.description}</span>}
                  </span>
                  {item.summary && <span className="ExtensionAccordion-summary">{item.summary}</span>}
                </button>

                {item.actions && <div className="ExtensionAccordion-actions">{item.actions}</div>}
              </div>

              {isExpanded && <div className="ExtensionAccordion-body">{item.content}</div>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface ExtensionAccordionMetaProps {
  items: Array<{ label: string, value?: ReactNode } | false | undefined>
}

/**
 * Label and value rows at the top of an expanded row, labels in one column
 * so values line up. Empty values are left out.
 */
export const ExtensionAccordionMeta: FC<ExtensionAccordionMetaProps> = ({ items }) => (
  <dl className="ExtensionAccordion-meta">
    {items.map((item) => item && item.value !== undefined && item.value !== null && item.value !== "" && (
      <div key={item.label} className="ExtensionAccordion-metaRow">
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </div>
    ))}
  </dl>
)

interface ExtensionAccordionPanelProps {
  title: string
  count?: number

  /**
   * Spans every column of the panel grid
   */
  isWide?: boolean
  children: ReactNode
}

/**
 * A titled card inside an expanded row. Panels sit side by side when the
 * pane is wide enough, wrap them in `.ExtensionAccordion-panels`.
 */
export const ExtensionAccordionPanel: FC<ExtensionAccordionPanelProps> = ({ title, count, isWide, children }) => (
  <section className={clsx("ExtensionAccordion-panel", isWide && "is-wide")}>
    <header className="ExtensionAccordion-panelHeader">
      <span>{title}</span>
      {count !== undefined && <span className="ExtensionAccordion-panelCount">{count}</span>}
    </header>
    <div className="ExtensionAccordion-panelBody">{children}</div>
  </section>
)
