import {
  type FC,
  type KeyboardEvent,
  type MouseEventHandler,
  type PointerEvent,
  type ClipboardEvent,
  type ReactNode,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { ClipboardService } from "src/services/clipboard-service"
import { clamp } from "src/utils/clamp"
import { lowerBound } from "src/utils/lower-bound"

import { LargeTextFindBar } from "./LargeTextFindBar.tsx"
import { findTextMatches, MAX_MATCHES } from "./find-text-matches.js"
import { findWordRange } from "./find-word-range.js"
import { TextLayout } from "./text-layout.js"

import "./LargeTextViewer.scss"

const PADDING_X = 8
const PADDING_Y = 14
const OVERSCAN_ROWS = 10

/**
 * Browsers stop growing an element somewhere past 16M px, taller content
 * scrolls through this height in proportionally larger steps
 */
const MAX_SCROLL_HEIGHT = 10_000_000

const PROBE_TEXT = "0".repeat(64)

interface TextSelection {
  anchor: number
  head: number
}

interface LargeTextViewerProps {
  text: string
  onContextMenu?: MouseEventHandler
}

/**
 * Read-only viewer for text too large for the code editor, such as a
 * multi-megabyte single line. The text is hard-wrapped on a fixed monospace
 * grid and only the rows on screen are rendered, so its cost does not grow
 * with the size of the text. Selection, copy and find work on offsets in the
 * text instead of the DOM, so they also cover rows that are not rendered.
 */
export const LargeTextViewer: FC<LargeTextViewerProps> = ({ text, onContextMenu }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)

  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [cell, setCell] = useState({ width: 0, height: 0 })
  const [scrollTop, setScrollTop] = useState(0)
  const [selection, setSelection] = useState<TextSelection>({ anchor: 0, head: 0 })

  const [isFindOpen, setIsFindOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [matchIndex, setMatchIndex] = useState(-1)

  // Measure the viewport and one character cell of the monospace font
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const probe = probeRef.current
    if (!scroller || !probe) {
      return
    }

    const measure = () => {
      const probeRect = probe.getBoundingClientRect()
      setCell({ width: probeRect.width / PROBE_TEXT.length, height: probeRect.height })
      setViewport({ width: scroller.clientWidth, height: scroller.clientHeight })
    }

    measure()
    void document.fonts.ready.then(measure)

    const observer = new ResizeObserver(measure)
    observer.observe(scroller)

    return () => { observer.disconnect() }
  }, [])

  const columns = cell.width > 0
    ? Math.max(1, Math.floor((viewport.width - PADDING_X * 2) / cell.width))
    : 1

  const lineStarts = useMemo(() => TextLayout.findLineStarts(text), [text])
  const layout = useMemo(() => new TextLayout(text, lineStarts, columns), [text, lineStarts, columns])

  // Scroll position in "virtual" pixels, which differ from the real ones only
  // when the content is taller than MAX_SCROLL_HEIGHT
  const rowHeight = cell.height || 1
  const contentHeight = layout.totalRows * rowHeight + PADDING_Y * 2
  const scrollHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)
  const scale = scrollHeight > viewport.height
    ? (contentHeight - viewport.height) / (scrollHeight - viewport.height)
    : 1
  const virtualTop = scrollTop * scale

  const firstRow = clamp(Math.floor((virtualTop - PADDING_Y) / rowHeight) - OVERSCAN_ROWS, 0, layout.totalRows)
  const lastRow = clamp(Math.ceil((virtualTop + viewport.height - PADDING_Y) / rowHeight) + OVERSCAN_ROWS, 0, layout.totalRows)
  const layerTop = scrollTop + PADDING_Y + firstRow * rowHeight - virtualTop

  // Event handlers read the latest layout without re-binding on every render
  const viewRef = useRef({ layout, firstRow, rowHeight, cellWidth: cell.width, scale, virtualTop })
  viewRef.current = { layout, firstRow, rowHeight, cellWidth: cell.width, scale, virtualTop }

  const selectionFrom = Math.min(selection.anchor, selection.head)
  const selectionTo = Math.max(selection.anchor, selection.head)

  // Selection and matches point into the old text, start over when it changes
  useEffect(() => {
    setSelection({ anchor: 0, head: 0 })
    setMatchIndex(-1)
  }, [text])

  /* ------------------------------------------------------------------ */
  /* Find                                                                */
  /* ------------------------------------------------------------------ */

  const deferredQuery = useDeferredValue(isFindOpen ? query : "")
  const foldedText = useMemo(
    () => deferredQuery && !caseSensitive ? text.toLowerCase() : "",
    [text, deferredQuery.length > 0, caseSensitive]
  )
  const matches = useMemo(
    () => findTextMatches(text, foldedText, deferredQuery, caseSensitive),
    [text, foldedText, deferredQuery, caseSensitive]
  )

  const goToMatch = (index: number) => {
    if (matches.length === 0) {
      return
    }

    const wrappedIndex = (index + matches.length) % matches.length
    const from = matches[wrappedIndex]

    setMatchIndex(wrappedIndex)
    setSelection({ anchor: from, head: from + deferredQuery.length })
    scrollToOffset(from)
  }

  // Jump to the first match after the current selection as the query changes
  useEffect(() => {
    if (matches.length === 0) {
      setMatchIndex(-1)
      return
    }

    const index = lowerBound(matches, selectionFrom)
    goToMatch(index === matches.length ? 0 : index)
  }, [matches])

  const openFind = () => {
    const selected = text.slice(selectionFrom, selectionTo)
    if (selected.length > 0 && selected.length <= 200 && !selected.includes("\n")) {
      setQuery(selected)
    }
    setIsFindOpen(true)
  }

  const closeFind = () => {
    setIsFindOpen(false)
    scrollerRef.current?.focus()
  }

  /* ------------------------------------------------------------------ */
  /* Scrolling                                                           */
  /* ------------------------------------------------------------------ */

  const scrollToOffset = (offset: number) => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }

    const { layout, rowHeight, scale, virtualTop } = viewRef.current
    const rowTop = PADDING_Y + layout.offsetPosition(offset).row * rowHeight
    const isVisible = rowTop >= virtualTop && rowTop + rowHeight <= virtualTop + scroller.clientHeight

    if (!isVisible) {
      scroller.scrollTop = (rowTop - scroller.clientHeight / 2) / scale
    }
  }

  /* ------------------------------------------------------------------ */
  /* Mouse selection                                                     */
  /* ------------------------------------------------------------------ */

  const dragRef = useRef({ isDragging: false, clientX: 0, clientY: 0, frame: 0 })

  const offsetAtPoint = (clientX: number, clientY: number) => {
    const layer = layerRef.current
    if (!layer) {
      return 0
    }

    const { layout, firstRow, rowHeight, cellWidth } = viewRef.current
    const rect = layer.getBoundingClientRect()
    const row = firstRow + Math.floor((clientY - rect.top) / rowHeight)
    const column = Math.round((clientX - rect.left - PADDING_X) / cellWidth)

    return layout.offsetAt(row, column)
  }

  const extendSelection = () => {
    const { clientX, clientY } = dragRef.current
    const head = offsetAtPoint(clientX, clientY)
    setSelection((selection) => selection.head === head ? selection : { ...selection, head })
  }

  // Keep scrolling while the pointer is dragged past the top or bottom edge
  const autoScroll = () => {
    const drag = dragRef.current
    const scroller = scrollerRef.current
    if (!drag.isDragging || !scroller) {
      return
    }

    const rect = scroller.getBoundingClientRect()
    const distance = drag.clientY < rect.top
      ? drag.clientY - rect.top
      : drag.clientY > rect.bottom ? drag.clientY - rect.bottom : 0

    if (distance !== 0) {
      scroller.scrollTop += distance
      extendSelection()
    }

    drag.frame = requestAnimationFrame(autoScroll)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Clicks on the scrollbar land on the scroller itself
    if (event.button !== 0 || !layerRef.current?.parentElement?.contains(event.target as Node)) {
      return
    }

    event.preventDefault()
    scrollerRef.current?.focus()

    const offset = offsetAtPoint(event.clientX, event.clientY)

    if (event.detail === 2) {
      const word = findWordRange(text, offset)
      setSelection({ anchor: word.from, head: word.to })
      return
    }
    if (event.detail >= 3) {
      const line = layout.lineAtOffset(offset)
      setSelection({ anchor: layout.lineFrom(line), head: layout.lineTo(line) })
      return
    }

    setSelection((selection) => event.shiftKey ? { ...selection, head: offset } : { anchor: offset, head: offset })

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { isDragging: true, clientX: event.clientX, clientY: event.clientY, frame: requestAnimationFrame(autoScroll) }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (drag.isDragging) {
      drag.clientX = event.clientX
      drag.clientY = event.clientY
      extendSelection()
    }
  }

  const handlePointerUp = () => {
    dragRef.current.isDragging = false
    cancelAnimationFrame(dragRef.current.frame)
  }

  useEffect(() => () => { cancelAnimationFrame(dragRef.current.frame) }, [])

  /* ------------------------------------------------------------------ */
  /* Keyboard and clipboard                                              */
  /* ------------------------------------------------------------------ */

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isMod = event.metaKey || event.ctrlKey
    const key = event.key.toLowerCase()

    if (isMod && key === "a") {
      event.preventDefault()
      setSelection({ anchor: 0, head: text.length })
    } else if (isMod && key === "c" && selectionTo > selectionFrom) {
      event.preventDefault()
      void ClipboardService.copyAsText(text.slice(selectionFrom, selectionTo))
    } else if (isMod && key === "f") {
      event.preventDefault()
      event.stopPropagation()
      openFind()
    } else if (event.key === "Escape" && isFindOpen) {
      closeFind()
    }
  }

  // Copy from the app menu arrives as a copy event instead of a key press
  const handleCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    if (selectionTo > selectionFrom) {
      event.preventDefault()
      event.clipboardData.setData("text/plain", text.slice(selectionFrom, selectionTo))
    }
  }

  /* ------------------------------------------------------------------ */
  /* Rows                                                                */
  /* ------------------------------------------------------------------ */

  const visibleFrom = lastRow > firstRow ? layout.rowRange(firstRow).from : 0
  const visibleTo = lastRow > firstRow ? layout.rowRange(lastRow - 1).to : 0
  const visibleMatches: number[] = []

  if (deferredQuery.length > 0) {
    for (let i = lowerBound(matches, visibleFrom - deferredQuery.length + 1); i < matches.length && matches[i] < visibleTo; i++) {
      visibleMatches.push(matches[i])
    }
  }

  const currentMatch = matches[matchIndex] ?? -1
  const rows: ReactNode[] = []

  for (let row = firstRow; row < lastRow; row++) {
    const { from, to, isLineEnd } = layout.rowRange(row)
    const marks: ReactNode[] = []

    const addMark = (start: number, end: number, className: string, includesLineBreak = false) => {
      const markFrom = Math.max(start, from)
      const markTo = Math.min(end, to)
      const cells = markTo - markFrom + (includesLineBreak ? 1 : 0)

      if (cells > 0 && markFrom <= to) {
        marks.push(
          <span
            key={`${className}-${start}`}
            className={`LargeTextViewer-mark ${className}`}
            style={{ left: PADDING_X + (markFrom - from) * cell.width, width: cells * cell.width }}
          />
        )
      }
    }

    for (const match of visibleMatches) {
      if (match < to && match + deferredQuery.length > from) {
        addMark(match, match + deferredQuery.length, match === currentMatch ? "is-currentMatch" : "is-match")
      }
    }

    if (selectionTo > selectionFrom) {
      addMark(selectionFrom, selectionTo, "is-selection", isLineEnd && selectionFrom <= to && selectionTo > to)
    }

    rows.push(
      <div key={row} className="LargeTextViewer-row" style={{ height: rowHeight }}>
        {marks}
        <span className="LargeTextViewer-rowText">{text.slice(from, to).replace(/[\t\r]/g, " ")}</span>
      </div>
    )
  }

  return (
    <div className="LargeTextViewer">
      <div className="LargeTextViewer-inner">
        {isFindOpen && (
          <LargeTextFindBar
            query={query}
            caseSensitive={caseSensitive}
            matchIndex={matchIndex}
            matchCount={matches.length}
            isCapped={matches.length >= MAX_MATCHES}
            onQueryChange={setQuery}
            onCaseSensitiveChange={setCaseSensitive}
            onNext={() => { goToMatch(matchIndex + 1) }}
            onPrevious={() => { goToMatch(matchIndex - 1) }}
            onClose={closeFind}
          />
        )}

        <div
          ref={scrollerRef}
          className="LargeTextViewer-scroller"
          tabIndex={0}
          onScroll={(event) => { setScrollTop(event.currentTarget.scrollTop) }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          onCopy={handleCopy}
          onContextMenu={onContextMenu}
        >
          <div className="LargeTextViewer-spacer" style={{ height: scrollHeight }}>
            <div ref={layerRef} className="LargeTextViewer-layer" style={{ transform: `translateY(${layerTop}px)` }}>
              {cell.width > 0 && rows}
            </div>
          </div>

          <div ref={probeRef} className="LargeTextViewer-row LargeTextViewer-probe" aria-hidden>
            {PROBE_TEXT}
          </div>
        </div>
      </div>
    </div>
  )
}
