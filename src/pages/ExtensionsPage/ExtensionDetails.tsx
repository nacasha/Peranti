import { clsx } from "clsx"
import { useState, type FC, type ReactNode } from "react"
import SimpleBar from "simplebar-react"

import { Icons } from "src/constants/icons"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOutput } from "src/types/AppletOutput"

export interface ExtensionDetailsField {
  label: string
  value: ReactNode
}

/**
 * A tab beside Overview
 */
export interface ExtensionDetailsTab {
  id: string
  label: string
  count?: number
  content: ReactNode

  /**
   * Fills the pane and scrolls inside its content instead of scrolling the
   * whole details, for the Files tab
   */
  isFill?: boolean
}

interface ExtensionDetailsProps {
  name: string
  version?: string
  author?: string

  /**
   * Short labels under the name, such as runtime and category
   */
  chips?: Array<string | false | undefined>

  /**
   * What it provides, such as "2 Tools" and "1 Component", shown first
   */
  provides?: string[]
  actions: ReactNode

  /**
   * Shown above the overview, for an error or a warning
   */
  notice?: ReactNode
  description?: string

  /**
   * Rows of the "Details" column, empty values are left out
   */
  fields: Array<ExtensionDetailsField | false | undefined>

  /**
   * Tabs after Overview, the tab bar is left out without any
   */
  tabs?: Array<ExtensionDetailsTab | false | undefined>

  /**
   * Shown in Overview, below the description
   */
  children?: ReactNode
}

const OVERVIEW = "overview"

/**
 * Right side of the extensions page: a header with the actions, then the
 * overview beside a column of details when the pane is wide enough, and
 * more tabs for what doesn't fit there
 */
export const ExtensionDetails: FC<ExtensionDetailsProps> = (props) => {
  const { name, version, author, chips = [], provides = [], actions, notice, description, fields, tabs = [], children } = props
  const [activeTabId, setActiveTabId] = useState(OVERVIEW)
  const visibleChips = chips.filter((chip): chip is string => !!chip)
  const visibleTabs = tabs.filter((tab): tab is ExtensionDetailsTab => !!tab)
  const visibleFields = fields.filter((field): field is ExtensionDetailsField => (
    !!field && field.value !== undefined && field.value !== null && field.value !== ""
  ))

  // Falls back to Overview when the picked tab is gone, such as after an update
  const activeTab = visibleTabs.find((tab) => tab.id === activeTabId)

  const renderTabButton = (id: string, label: string, count?: number) => (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={(activeTab?.id ?? OVERVIEW) === id}
      className={clsx("ExtensionDetails-tab", (activeTab?.id ?? OVERVIEW) === id && "active")}
      onClick={() => { setActiveTabId(id) }}
    >
      {label}
      {count !== undefined && <span className="ExtensionDetails-tab-count">{count}</span>}
    </button>
  )

  const header = (
    <>
      <header className="ExtensionDetails-hero">
        <div className="ExtensionDetails-heading">
          <div className="ExtensionDetails-title">
            <h2 className="ExtensionDetails-name">{name}</h2>
            {version && <span className="ExtensionDetails-version">v{version}</span>}
          </div>

          {(!!author || visibleChips.length > 0 || provides.length > 0) && (
            <div className="ExtensionDetails-byline">
              {author && <span className="ExtensionDetails-author">{author}</span>}
              {provides.map((label) => (
                <span key={label} className="ExtensionDetails-chip is-provides">{label}</span>
              ))}
              {visibleChips.map((chip) => (
                <span key={chip} className="ExtensionDetails-chip">{chip}</span>
              ))}
            </div>
          )}

          <div className="ExtensionDetails-actions">{actions}</div>
        </div>
      </header>

      {visibleTabs.length > 0 && (
        <div className="ExtensionDetails-tabs" role="tablist">
          {renderTabButton(OVERVIEW, "Overview")}
          {visibleTabs.map((tab) => renderTabButton(tab.id, tab.label, tab.count))}
        </div>
      )}
    </>
  )

  if (activeTab?.isFill) {
    return (
      <div className="ExtensionDetails is-fill">
        {header}
        <div className="ExtensionDetails-filesPane">{activeTab.content}</div>
      </div>
    )
  }

  return (
    <div className="ExtensionsPage-scrollArea">
      <SimpleBar className="ExtensionsPage-scroll">
        <div className="ExtensionDetails">
          {header}

          {activeTab
            ? <div className="ExtensionDetails-tabBody">{activeTab.content}</div>
            : (
              <div className="ExtensionDetails-body">
                <div className="ExtensionDetails-main">
                  {notice}

                  <ExtensionDetailsSection title="Overview">
                    {description
                      ? <p className="ExtensionDetails-description">{description}</p>
                      : <p className="ExtensionDetails-description is-empty">No description provided.</p>}
                  </ExtensionDetailsSection>

                  {children}
                </div>

                {visibleFields.length > 0 && (
                  <aside className="ExtensionDetails-aside">
                    <ExtensionDetailsSection title="Details">
                      <dl className="ExtensionDetails-fields">
                        {visibleFields.map((field) => (
                          <div key={field.label} className="ExtensionDetails-field">
                            <dt>{field.label}</dt>
                            <dd>{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </ExtensionDetailsSection>
                  </aside>
                )}
              </div>
            )}
        </div>
      </SimpleBar>
    </div>
  )
}

interface ExtensionDetailsSectionProps {
  title: string

  /**
   * Muted text beside the title, such as a count
   */
  aside?: ReactNode
  children: ReactNode
}

export const ExtensionDetailsSection: FC<ExtensionDetailsSectionProps> = ({ title, aside, children }) => (
  <section className="ExtensionDetails-section">
    <div className="ExtensionDetails-section-title">
      {title}
      {aside !== undefined && <span className="ExtensionDetails-section-aside">{aside}</span>}
    </div>
    {children}
  </section>
)

interface ExtensionDetailsNoticeProps {
  tone: "danger" | "warning"
  title: string
  children: ReactNode
}

export const ExtensionDetailsNotice: FC<ExtensionDetailsNoticeProps> = ({ tone, title, children }) => (
  <div className={clsx("ExtensionDetails-notice", `is-${tone}`)} role={tone === "danger" ? "alert" : undefined}>
    <Icons.Warning size={15} aria-hidden />
    <div>
      <div className="ExtensionDetails-notice-title">{title}</div>
      <div className="ExtensionDetails-notice-body">{children}</div>
    </div>
  </div>
)

interface ExtensionFieldsListProps {
  inputFields?: unknown
  outputFields?: unknown
}

/**
 * Inputs and outputs the tool shows, when the manifest lists them as arrays
 */
export const ExtensionFieldsList: FC<ExtensionFieldsListProps> = ({ inputFields, outputFields }) => {
  const groups = [
    { title: "Inputs", fields: Array.isArray(inputFields) ? inputFields as AppletInput[] : [] },
    { title: "Outputs", fields: Array.isArray(outputFields) ? outputFields as AppletOutput[] : [] }
  ].filter((group) => group.fields.length > 0)

  if (groups.length === 0) {
    return null
  }

  return (
    <>
      {groups.map((group) => (
        <ExtensionDetailsSection key={group.title} title={group.title} aside={group.fields.length}>
          <div className="ExtensionDetails-tableWrap">
            <table className="ExtensionDetails-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Key</th>
                  <th>Component</th>
                </tr>
              </thead>
              <tbody>
                {group.fields.map((field) => (
                  <tr key={String(field.key)}>
                    <td>{field.label || <span className="ExtensionDetails-table-muted">—</span>}</td>
                    <td><code>{String(field.key)}</code></td>
                    <td><span className="ExtensionDetails-chip">{String(field.component)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExtensionDetailsSection>
      ))}
    </>
  )
}
