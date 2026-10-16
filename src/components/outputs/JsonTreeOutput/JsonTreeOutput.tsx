import { clsx } from "clsx"
import { useDeferredValue, useEffect, useMemo, useRef, useState, type FC, type UIEvent } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"
import { ClipboardService } from "src/services/clipboard-service"
import { type OutputComponentProps } from "src/types/OutputComponentProps"
import { clamp } from "src/utils/common/clamp"
import { pluralize } from "src/utils/text/pluralize"

import {
  collectJsonBranchPaths,
  collectJsonMatchPaths,
  collectJsonPathsToDepth,
  flattenJsonTree,
  parseJsonTreeValue,
  type JsonTreeRow
} from "./json-tree-rows.ts"

import "./JsonTreeOutput.scss"

/**
 * Must match `.JsonTreeOutput-row` height and `.JsonTreeOutput-scroll` padding
 */
const ROW_HEIGHT = 24
const PADDING_Y = 6

/**
 * Rows rendered above and below the visible ones, so fast scrolling doesn't
 * flash empty space
 */
const OVERSCAN_ROWS = 10

interface JsonTreeState {
  /**
   * Expanded paths, `undefined` until the tree is first toggled so new data
   * opens at `expandDepth`
   */
  expanded?: string[]
}

export interface JsonTreeOutputProps extends OutputComponentProps<unknown> {
  /**
   * Levels opened when the data is first shown
   */
  expandDepth?: number
}

export const JsonTreeOutput: FC<JsonTreeOutputProps> = (props) => {
  const { label, fieldKey, value, expandDepth = 2, initialState, onStateChange } = props
  const persistedState = initialState as JsonTreeState | undefined

  const [expandedPaths, setExpandedPaths] = useState(persistedState?.expanded)
  const [query, setQuery] = useState("")
  const [filterView, setFilterView] = useState({
    query: "",
    revealed: new Set<string>(),
    collapsed: new Set<string>()
  })
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => { clearTimeout(copiedTimeoutRef.current) }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }

    const measure = () => { setViewportHeight(scroller.clientHeight) }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(scroller)

    return () => { observer.disconnect() }
  }, [])

  /**
   * Keep showing the last valid data while the value is not (yet) valid JSON
   */
  const lastValidRef = useRef<{ data: unknown }>({ data: undefined })
  const [data, isInvalid] = useMemo(() => {
    const parsed = parseJsonTreeValue(value)
    if (parsed) {
      lastValidRef.current = parsed
    }
    return [lastValidRef.current.data, !parsed]
  }, [value])

  const expanded = useMemo(
    () => new Set(expandedPaths ?? collectJsonPathsToDepth(data, expandDepth)),
    [expandedPaths, data, expandDepth]
  )

  // Searching walks the whole tree, so typing stays responsive on large data
  // while the matches catch up
  const trimmedQuery = useDeferredValue(query.trim())
  const matches = useMemo(
    () => (data !== undefined && trimmedQuery ? collectJsonMatchPaths(data, trimmedQuery) : undefined),
    [data, trimmedQuery]
  )

  // Revealed and collapsed branches belong to the query they were set under,
  // a new query starts from every match open and nothing else shown
  const { revealed, collapsed } = useMemo(
    () => (filterView.query === trimmedQuery
      ? filterView
      : { revealed: new Set<string>(), collapsed: new Set<string>() }),
    [filterView, trimmedQuery]
  )

  const rows = useMemo(() => {
    if (data === undefined) {
      return []
    }
    const filter = matches && { ...matches, revealed, collapsed }
    return flattenJsonTree(data, expanded, filter)
  }, [data, expanded, matches, revealed, collapsed])

  const firstRow = clamp(Math.floor((scrollTop - PADDING_Y) / ROW_HEIGHT) - OVERSCAN_ROWS, 0, rows.length)
  const lastRow = clamp(Math.ceil((scrollTop + viewportHeight - PADDING_Y) / ROW_HEIGHT) + OVERSCAN_ROWS, 0, rows.length)

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  const changeExpanded = (paths: string[]) => {
    setExpandedPaths(paths)
    onStateChange?.({ expanded: paths } satisfies JsonTreeState)
  }

  const toggleRow = (row: JsonTreeRow) => {
    const next = new Set(expanded)
    if (next.has(row.path)) {
      next.delete(row.path)
    } else {
      next.add(row.path)
    }
    changeExpanded([...next])
  }

  const toggleIn = (paths: Set<string>, path: string, isIncluded: boolean) => {
    const next = new Set(paths)
    if (isIncluded) {
      next.add(path)
    } else {
      next.delete(path)
    }
    return next
  }

  const toggleRevealed = (row: JsonTreeRow) => {
    setFilterView({
      query: trimmedQuery,
      revealed: toggleIn(revealed, row.path, !revealed.has(row.path)),
      // Revealing opens the branch, so the new children are seen
      collapsed: toggleIn(collapsed, row.path, false)
    })
  }

  const toggleCollapsed = (row: JsonTreeRow) => {
    setFilterView({
      query: trimmedQuery,
      revealed,
      collapsed: toggleIn(collapsed, row.path, !collapsed.has(row.path))
    })
  }

  const copy = async(key: string, text: string) => {
    await ClipboardService.copyAsText(text)

    clearTimeout(copiedTimeoutRef.current)
    setCopiedKey(key)
    copiedTimeoutRef.current = setTimeout(() => { setCopiedKey(null) }, 1500)
  }

  const copyValue = (row: JsonTreeRow) => {
    const text = row.kind === "string" ? row.value as string : JSON.stringify(row.value, null, 2)
    void copy(`value:${row.path}`, text)
  }

  const handleClickRow = (row: JsonTreeRow) => {
    if (row.size !== undefined) {
      if (trimmedQuery) {
        // A branch leading to no match has nothing to open but its own fields
        if (row.hiddenCount === row.size && !row.isRevealed) {
          toggleRevealed(row)
        } else {
          toggleCollapsed(row)
        }
      } else {
        toggleRow(row)
      }
    } else {
      copyValue(row)
    }
  }

  const renderValue = (row: JsonTreeRow) => {
    if (row.size !== undefined) {
      const isArray = row.kind === "array"
      const summary = pluralize(row.size, isArray ? "item" : "key")
      return (
        <span className="JsonTreeOutput-summary">
          {isArray ? "[" : "{"}
          <span className="JsonTreeOutput-count">{summary}</span>
          {isArray ? "]" : "}"}
        </span>
      )
    }

    const text = row.kind === "string" ? JSON.stringify(row.value) : String(row.value)
    return <span className={`JsonTreeOutput-value is-${row.kind}`}>{highlight(text, row.isMatch)}</span>
  }

  /**
   * While filtering, an expanded branch offers to show the children hidden
   * for not leading to a match, then to go back to the matches only
   */
  const renderRevealButton = (row: JsonTreeRow) => {
    if (!trimmedQuery || !row.isExpanded || (!row.hiddenCount && !row.isRevealed)) {
      return null
    }

    return (
      <button
        className="JsonTreeOutput-reveal"
        onClick={(event) => {
          event.stopPropagation()
          toggleRevealed(row)
        }}
      >
        {row.isRevealed ? "Only matches" : `Show ${row.hiddenCount} more`}
      </button>
    )
  }

  /**
   * Mark where the query occurs in a matching key or value
   */
  const highlight = (text: string, isMatch?: boolean) => {
    const index = isMatch ? text.toLowerCase().indexOf(trimmedQuery.toLowerCase()) : -1
    if (index < 0 || !trimmedQuery) {
      return text
    }

    const end = index + trimmedQuery.length
    return (
      <>
        {text.slice(0, index)}
        <mark className="JsonTreeOutput-mark">{text.slice(index, end)}</mark>
        {text.slice(end)}
      </>
    )
  }

  const renderRow = (row: JsonTreeRow, index: number) => {
    const style = { top: PADDING_Y + index * ROW_HEIGHT, paddingLeft: 10 + row.depth * 16 }

    const isBranch = row.size !== undefined
    const isPathCopied = copiedKey === `path:${row.path}`
    const isValueCopied = copiedKey === `value:${row.path}`

    return (
      <div
        key={row.path}
        className={clsx("JsonTreeOutput-row", isBranch && "is-branch")}
        style={style}
        title={row.path}
        onClick={() => { handleClickRow(row) }}
      >
        <span className="JsonTreeOutput-toggle">
          {isBranch && (row.isExpanded
            ? <Icons.ChevronDown size={13} aria-hidden />
            : <Icons.ChevronRight size={13} aria-hidden />)}
        </span>
        {row.name !== undefined && (
          <>
            <span className={clsx("JsonTreeOutput-key", typeof row.name === "number" && "is-index")}>
              {highlight(String(row.name), row.isMatch)}
            </span>
            <span className="JsonTreeOutput-colon">:</span>
          </>
        )}
        {renderValue(row)}
        {renderRevealButton(row)}
        <span className="JsonTreeOutput-actions" onClick={(event) => { event.stopPropagation() }}>
          <ButtonIcon
            tooltip={isPathCopied ? "Copied" : "Copy path"}
            icon={isPathCopied ? Icons.CopyDone : Icons.Hash}
            iconSize={12}
            onClick={() => { void copy(`path:${row.path}`, row.path) }}
          />
          <ButtonIcon
            tooltip={isValueCopied ? "Copied" : "Copy value"}
            icon={isValueCopied ? Icons.CopyDone : Icons.Copy}
            iconSize={12}
            onClick={() => { copyValue(row) }}
          />
        </span>
      </div>
    )
  }

  return (
    <div className="JsonTreeOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="JsonTreeOutput-body">
        <div className="JsonTreeOutput-toolbar">
          <label className="JsonTreeOutput-search">
            <Icons.Search size={13} aria-hidden />
            <input
              type="text"
              placeholder="Filter keys and values"
              value={query}
              spellCheck={false}
              onChange={(event) => { setQuery(event.target.value) }}
            />
          </label>
          <ButtonIcon
            tooltip="Expand all"
            icon={Icons.ExpandAll}
            iconSize={13}
            disabled={data === undefined || !!trimmedQuery}
            onClick={() => { changeExpanded(collectJsonBranchPaths(data)) }}
          />
          <ButtonIcon
            tooltip="Collapse all"
            icon={Icons.CollapseAll}
            iconSize={13}
            disabled={data === undefined || !!trimmedQuery}
            onClick={() => { changeExpanded([]) }}
          />
        </div>
        <div className="JsonTreeOutput-rows">
          <div className="JsonTreeOutput-scroll" ref={scrollerRef} onScroll={handleScroll}>
            <div className="JsonTreeOutput-spacer" style={{ height: rows.length * ROW_HEIGHT }}>
              {rows.slice(firstRow, lastRow).map((row, offset) => renderRow(row, firstRow + offset))}
            </div>
            {data === undefined && <div className="JsonTreeOutput-empty">No data</div>}
            {data !== undefined && trimmedQuery && rows.length === 0 && (
              <div className="JsonTreeOutput-empty">No matches</div>
            )}
          </div>
        </div>
        {isInvalid && <div className="JsonTreeOutput-error">Invalid JSON, showing the last valid value</div>}
      </div>
    </div>
  )
}
