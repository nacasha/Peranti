import { observer } from "mobx-react"
import { useEffect, useRef, useState, type FC } from "react"
import SimpleBar from "simplebar-react"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { HighlightedText } from "src/components/common/HighlightedText"
import { Icons } from "src/constants/icons"
import { Links } from "src/constants/links"
import { appletStore } from "src/services/applet-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { type SessionHistory } from "src/types/SessionHistory"
import { formatFileSize } from "src/utils/format-file-size"
import { formatTimeAgo } from "src/utils/format-time-ago"
import { getDayGroupLabel } from "src/utils/get-day-group-label"
import { getHistoryPreviewFields } from "src/utils/get-history-preview-fields"
import { openLink } from "src/utils/open-link"
import { prettyDateFormat } from "src/utils/pretty-date-format"

import { HistoryPreview } from "./HistoryPreview.tsx"

import "./HistoryPage.scss"

const PAGE_SIZE = 50

const SEARCH_DEBOUNCE = 200

/**
 * Pixels from the bottom of the list at which the next page loads
 */
const LOAD_MORE_THRESHOLD = 240

interface HistoryGroup {
  label: string
  histories: SessionHistory[]
}

/**
 * Closed tabs history, rendered as one card filling the whole area like a
 * maximized field: header with search and actions, and a scrolling list grouped
 * by day
 */
export const HistoryPage: FC = observer(() => {
  const { featureEnabled, revision, isSupported } = sessionHistoryStore
  const isAvailable = isSupported && featureEnabled

  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")
  const [histories, setHistories] = useState<SessionHistory[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Only the latest request may update the list, so a slow search for an
   * older keyword never overwrites a newer one
   */
  const requestIdRef = useRef(0)
  const loadedCountRef = useRef(0)

  const loadPage = async(offset: number, limit: number = PAGE_SIZE) => {
    const requestId = ++requestIdRef.current
    setIsLoading(true)

    try {
      const page = await sessionHistoryStore.list({ query: query || undefined, offset, limit })
      if (requestId !== requestIdRef.current) return

      setHistories((previous) => {
        const next = offset === 0 ? page.items : previous.concat(page.items)
        loadedCountRef.current = next.length
        return next
      })
      setTotal(page.total)
    } catch (error) {
      console.error("Failed to load history", error)
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => { setQuery(keyword.trim()) }, SEARCH_DEBOUNCE)
    return () => { clearTimeout(timeout) }
  }, [keyword])

  // A new search starts from the top
  useEffect(() => {
    if (isAvailable) void loadPage(0)
  }, [query, isAvailable])

  // History changed elsewhere (closed, restored, deleted): reload what's shown
  useEffect(() => {
    if (isAvailable) void loadPage(0, Math.max(PAGE_SIZE, loadedCountRef.current))
  }, [revision])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD

    if (isNearBottom && !isLoading && histories.length < total) {
      void loadPage(histories.length)
    }
  }

  const now = Date.now()

  const getToolName = (history: SessionHistory) => (
    appletStore.mapOfLoadedAppletsName[history.appletId] ?? history.appletId
  )

  const isTitleMatch = (history: SessionHistory) => {
    const keyword = query.toLowerCase()
    return [getToolName(history), history.sessionName ?? ""].some((text) => text.toLowerCase().includes(keyword))
  }

  /**
   * The tab's fields, with the search match highlighted, plus the text around
   * the match when it's neither in the title nor in what the fields show.
   * Applets showing no fields get the first line of their text instead.
   */
  const renderPreview = (history: SessionHistory) => {
    const searchResultPreview = query && !isTitleMatch(history) ? history.searchResultPreview : undefined
    const fields = getHistoryPreviewFields(appletStore.mapOfLoadedApplets[history.appletId])

    if (fields.length > 0) {
      return <HistoryPreview history={history} fields={fields} query={query} searchResultPreview={searchResultPreview} />
    }

    const text = searchResultPreview ?? history.preview
    return text && (
      <div className="HistoryPage-item-preview">
        <HighlightedText text={text} query={query} />
      </div>
    )
  }

  // Entries come newest first, so consecutive entries share a day
  const groups = histories.reduce<HistoryGroup[]>((result, history) => {
    const label = getDayGroupLabel(history.deletedAt, now)
    const lastGroup = result[result.length - 1]

    if (lastGroup?.label === label) {
      lastGroup.histories.push(history)
    } else {
      result.push({ label, histories: [history] })
    }
    return result
  }, [])

  const handleRestore = (history: SessionHistory) => () => {
    void sessionHistoryStore.restoreHistory(history)
  }

  const handleDelete = (history: SessionHistory) => (event: React.MouseEvent) => {
    event.stopPropagation()
    void sessionHistoryStore.deleteHistory(history)
  }

  const handleClearHistory = () => {
    sessionHistoryStore.clearAllHistoryWithConfirm()
  }

  const handleEnableHistory = () => {
    sessionHistoryStore.setFeatureEnabled(true)
  }

  if (!isSupported) {
    return (
      <div className="HistoryPage">
        <div className="HistoryPage-placeholder">
          <Icons.History size={26} aria-hidden />
          <div className="HistoryPage-placeholder-title">History is available in the desktop app</div>
          <div className="HistoryPage-placeholder-description">
            Keep closed tabs, search their inputs and outputs, and reopen them later with the desktop version of Peranti.
          </div>
          <Button icon={Icons.Download} onClick={() => { void openLink(Links.DesktopReleases) }}>
            Get the Desktop App
          </Button>
        </div>
      </div>
    )
  }

  if (!featureEnabled) {
    return (
      <div className="HistoryPage">
        <div className="HistoryPage-placeholder">
          <Icons.History size={26} aria-hidden />
          <div className="HistoryPage-placeholder-title">History is disabled</div>
          <div className="HistoryPage-placeholder-description">
            Closed tabs aren&apos;t being kept. Enable history to reopen tabs after closing them.
          </div>
          <Button icon={Icons.History} onClick={handleEnableHistory}>
            Enable History
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="HistoryPage">
      <div className="HistoryPage-header">
        <div className="HistoryPage-search">
          <Icons.Search size={13} aria-hidden />
          <input
            placeholder="Search tool, tab name, input or output"
            value={keyword}
            onChange={(event) => { setKeyword(event.target.value) }}
            autoComplete="off"
          />
        </div>

        <span className="HistoryPage-count">{total}</span>

        {!query && total > 0 && (
          <ButtonIcon
            tooltip="Clear All"
            icon={Icons.Clean}
            onClick={handleClearHistory}
          />
        )}
      </div>

      <div className="HistoryPage-body">
        <SimpleBar
          className="HistoryPage-scroll"
          scrollableNodeProps={{ onScroll: handleScroll }}
        >
          {!isLoading && groups.length === 0 && (
            <div className="HistoryPage-empty">
              <Icons.History size={22} aria-hidden />
              <div className="HistoryPage-empty-title">
                {query ? "No matching tabs" : "No closed tabs"}
              </div>
              {!query && (
                <div className="HistoryPage-empty-description">
                  Tabs you close after running them show up here
                </div>
              )}
            </div>
          )}

          {groups.map((group) => (
            <div key={group.label} className="HistoryPage-group">
              <div className="HistoryPage-group-label">{group.label}</div>

              {group.histories.map((history) => (
                <div
                  key={history.sessionId}
                  className="HistoryPage-item"
                  role="button"
                  tabIndex={0}
                  onClick={handleRestore(history)}
                >
                  <Icons.Tool className="HistoryPage-item-icon" size={13} aria-hidden />

                  <div className="HistoryPage-item-title">
                    <span className="HistoryPage-item-tool">
                      <HighlightedText text={getToolName(history)} query={query} />
                    </span>
                    {history.sessionName && (
                      <span className="HistoryPage-item-name">
                        <HighlightedText text={history.sessionName} query={query} />
                      </span>
                    )}
                  </div>

                  <div className="HistoryPage-item-body">
                    {renderPreview(history)}
                  </div>

                  {history.size !== undefined && (
                    <span className="HistoryPage-item-size" title="Storage used by this entry">
                      {formatFileSize(history.size)}
                    </span>
                  )}

                  {/* One fixed-width slot: the time, swapped for the actions on hover */}
                  <div className="HistoryPage-item-end">
                    <span
                      className="HistoryPage-item-time"
                      title={prettyDateFormat(new Date(history.deletedAt))}
                    >
                      {formatTimeAgo(history.deletedAt, now)}
                    </span>

                    <div className="HistoryPage-item-actions">
                      <ButtonIcon
                        tooltip="Restore"
                        icon={Icons.Restore}
                        iconSize={13}
                      />
                      <ButtonIcon
                        tooltip="Delete"
                        icon={Icons.Trash}
                        iconSize={13}
                        onClick={handleDelete(history)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </SimpleBar>
      </div>
    </div>
  )
})
