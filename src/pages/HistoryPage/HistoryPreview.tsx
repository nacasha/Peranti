import { useEffect, useRef, useState, type FC } from "react"

import { HighlightedText } from "src/components/common/HighlightedText"
import { TextHistory } from "src/components/history/TextHistory"
import { sessionHistoryStore } from "src/services/session-history-store"
import { type HistoryPreviewField } from "src/types/AppletHistory"
import { type SessionHistory } from "src/types/SessionHistory"
import { toPreviewText } from "src/utils/to-preview-text"

interface HistoryPreviewProps {
  history: SessionHistory
  fields: HistoryPreviewField[]

  /**
   * Search keyword, highlighted in the values
   */
  query?: string

  /**
   * Text around the match, added at the end when none of the values shows
   * the match (it's deeper than they're cut)
   */
  searchResultPreview?: string
}

/**
 * A closed tab's inputs, then its outputs, each drawn by its component's
 * history component. Loaded only once the row scrolls near the view: the
 * values come out of the stored tab state, and images can be large.
 */
export const HistoryPreview: FC<HistoryPreviewProps> = ({ history, fields, query, searchResultPreview }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<unknown[]>()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let isCancelled = false
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return

      observer.disconnect()
      sessionHistoryStore.getFieldValues(history, fields)
        .then((result) => { if (!isCancelled) setValues(result) })
        .catch((error) => { console.error("Failed to load history preview", error) })
    }, { rootMargin: "200px" })

    observer.observe(element)

    return () => {
      isCancelled = true
      observer.disconnect()
    }
  }, [history.sessionId])

  const renderGroup = (source: HistoryPreviewField["source"]) => values && fields.map((field, index) => {
    const value = values[index]
    if (field.source !== source || value === undefined || value === null || value === "") {
      return null
    }

    const Component = field.Component ?? TextHistory
    return <Component key={`${field.source}-${field.key}`} value={value} query={query} />
  })

  // Text values are cut short, so a match deep inside one isn't on screen
  const isMatchShown = !query || values?.some((value) => (
    toPreviewText(value)?.toLowerCase().includes(query.toLowerCase())
  ))
  const showSearchResultPreview = values && !isMatchShown && searchResultPreview

  // The arrow between the groups is drawn in CSS, only when both show something
  return (
    <div ref={ref} className="HistoryPreview">
      <span className="HistoryPreview-group">{renderGroup("input")}</span>
      <span className="HistoryPreview-group">{renderGroup("output")}</span>
      {showSearchResultPreview && (
        <span className="HistoryPreview-searchResult">
          <HighlightedText text={searchResultPreview} query={query} />
        </span>
      )}
    </div>
  )
}
