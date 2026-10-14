import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

import { type ExtensionListItemTag } from "./ExtensionListItem.tsx"

interface ExtensionStoreCardProps {
  name: string
  version?: string
  author?: string
  description?: string
  category?: string

  /**
   * What it provides, such as "2 Tools" and "1 Component"
   */
  provides?: string[]
  tag?: ExtensionListItemTag

  /**
   * Button at the bottom right, such as Install or Update. Clicking it doesn't
   * open the details.
   */
  action?: ReactNode

  /**
   * Faded, for a disabled extension
   */
  isDimmed?: boolean
  onSelect: () => void
}

/**
 * One extension in the store grid: name and author, a short description,
 * then what it provides beside its main action
 */
export const ExtensionStoreCard: FC<ExtensionStoreCardProps> = (props) => {
  const { name, version, author, description, category, provides = [], tag, action, isDimmed, onSelect } = props

  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx("ExtensionStoreCard", isDimmed && "is-dimmed")}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="ExtensionStoreCard-header">
        <div className="ExtensionStoreCard-title">
          <span className="ExtensionStoreCard-name">{name}</span>
          {version && <span className="ExtensionStoreCard-version">v{version}</span>}
        </div>
        {tag && <span className={clsx("ExtensionStoreCard-tag", `is-${tag.tone}`)}>{tag.label}</span>}
      </div>

      {(!!author || !!category) && (
        <div className="ExtensionStoreCard-byline">
          {[author, category].filter(Boolean).join(" · ")}
        </div>
      )}

      <div className="ExtensionStoreCard-description">
        {description ?? <span className="ExtensionStoreCard-muted">No description</span>}
      </div>

      <div className="ExtensionStoreCard-footer">
        <div className="ExtensionStoreCard-provides">
          {provides.map((label) => <span key={label}>{label}</span>)}
        </div>
        {action && (
          // Kept apart from the card's own click, so it only runs the action
          <div
            className="ExtensionStoreCard-action"
            onClick={(event) => { event.stopPropagation() }}
            onKeyDown={(event) => { event.stopPropagation() }}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
