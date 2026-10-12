import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

export interface ExtensionListItemTag {
  label: string
  tone: "accent" | "danger" | "muted"
}

interface ExtensionListItemProps {
  name: string
  version?: string
  description?: string

  /**
   * Muted line under the description, such as author and runtime
   */
  meta?: ReactNode

  /**
   * What it provides, such as "2 Tools" and "1 Component", shown before the meta
   */
  provides?: string[]
  tag?: ExtensionListItemTag

  /**
   * Faded, for a disabled extension
   */
  isDimmed?: boolean
  isSelected: boolean
  onSelect: () => void
}

/**
 * One compact row of the extension list, picking it shows its details
 */
export const ExtensionListItem: FC<ExtensionListItemProps> = (props) => {
  const { name, version, description, meta, provides = [], tag, isDimmed, isSelected, onSelect } = props

  return (
    <button
      type="button"
      className={clsx("ExtensionListItem", isSelected && "is-selected", isDimmed && "is-dimmed")}
      aria-current={isSelected}
      onClick={onSelect}
    >
      <span className="ExtensionListItem-main">
        <span className="ExtensionListItem-title">
          <span className="ExtensionListItem-name">{name}</span>
          {version && <span className="ExtensionListItem-version">{version}</span>}
          {tag && <span className={clsx("ExtensionListItem-tag", `is-${tag.tone}`)}>{tag.label}</span>}
        </span>

        {description && <span className="ExtensionListItem-description">{description}</span>}
        {(provides.length > 0 || !!meta) && (
          <span className="ExtensionListItem-footer">
            {provides.map((label) => (
              <span key={label} className="ExtensionListItem-provides">{label}</span>
            ))}
            {meta && <span className="ExtensionListItem-meta">{meta}</span>}
          </span>
        )}
      </span>
    </button>
  )
}
