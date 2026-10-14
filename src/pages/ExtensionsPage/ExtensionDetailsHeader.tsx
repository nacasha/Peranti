import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

export interface ExtensionDetailsHeaderChip {
  label: string

  /**
   * Shown on hover, for what the label leaves out
   */
  title?: string

  /**
   * "provides" sets it apart, for what the thing is or provides
   */
  tone?: "provides"
}

interface ExtensionDetailsHeaderProps {
  name: string

  /**
   * Small and muted beside the name, such as the version or the id
   */
  suffix?: ReactNode

  /**
   * First in the byline, such as the author or where it comes from
   */
  subtitle?: string

  /**
   * Short labels after the subtitle, empty values are left out
   */
  chips?: Array<ExtensionDetailsHeaderChip | string | false | undefined>

  /**
   * Below the byline, for a page without an overview to put it in
   */
  description?: string
  actions?: ReactNode
}

/**
 * Top of a details pane: the name, a byline of chips and the actions below,
 * over the dotted backdrop. Shared by the extensions and Manage pages.
 */
export const ExtensionDetailsHeader: FC<ExtensionDetailsHeaderProps> = (props) => {
  const { name, suffix, subtitle, chips = [], description, actions } = props
  const visibleChips = chips
    .filter((chip): chip is ExtensionDetailsHeaderChip | string => !!chip)
    .map((chip) => typeof chip === "string" ? { label: chip } : chip)

  return (
    <header className="ExtensionDetails-hero">
      <div className="ExtensionDetails-heading">
        <div className="ExtensionDetails-title">
          <h2 className="ExtensionDetails-name">{name}</h2>
          {suffix && <span className="ExtensionDetails-version">{suffix}</span>}
        </div>

        {(!!subtitle || visibleChips.length > 0) && (
          <div className="ExtensionDetails-byline">
            {subtitle && <span className="ExtensionDetails-author">{subtitle}</span>}
            {visibleChips.map((chip) => (
              <span
                key={chip.label}
                className={clsx("ExtensionDetails-chip", chip.tone === "provides" && "is-provides")}
                title={chip.title}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {description && <p className="ExtensionDetails-heroDescription">{description}</p>}

        {actions && <div className="ExtensionDetails-actions">{actions}</div>}
      </div>
    </header>
  )
}
