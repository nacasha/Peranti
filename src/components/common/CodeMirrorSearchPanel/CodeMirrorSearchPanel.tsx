import {
  SearchQuery,
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  setSearchQuery
} from "@codemirror/search"
import { type EditorState, type EditorView, runScopeHandlers } from "@uiw/react-codemirror"
import { type FC, type KeyboardEvent, type MouseEvent, useEffect, useMemo, useState } from "react"

import { Icons, type Icon as IconType } from "src/constants/icons"
import { countSearchMatches } from "src/utils/count-search-matches"
import { isMacOS } from "src/utils/get-os"

import { Tooltip } from "../Tooltip"

import "./CodeMirrorSearchPanel.scss"

// CodeMirror's openSearchPanel focuses the input carrying this attribute
const mainFieldAttribute = { "main-field": "true" }

interface CodeMirrorSearchPanelProps {
  view: EditorView
  state: EditorState
}

export const CodeMirrorSearchPanel: FC<CodeMirrorSearchPanelProps> = ({ view, state }) => {
  const query = getSearchQuery(state)

  // Local copies so typing stays synchronous; the editor state catches up on dispatch
  const [search, setSearch] = useState(query.search)
  const [replace, setReplace] = useState(query.replace)
  const [replaceOpen, setReplaceOpen] = useState(query.replace.length > 0)

  // Pick up queries set from outside, e.g. Mod-F seeding from the selection
  useEffect(() => { setSearch(query.search) }, [query.search])
  useEffect(() => { setReplace(query.replace) }, [query.replace])

  const matches = useMemo(
    () => countSearchMatches(state, query),
    [state.doc, state.selection, query]
  )

  const commit = (spec: Partial<ConstructorParameters<typeof SearchQuery>[0]>) => {
    const nextQuery = new SearchQuery({
      search: query.search,
      replace: query.replace,
      caseSensitive: query.caseSensitive,
      regexp: query.regexp,
      wholeWord: query.wholeWord,
      literal: query.literal,
      ...spec
    })

    if (!nextQuery.eq(query)) {
      view.dispatch({ effects: setSearchQuery.of(nextQuery) })
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (runScopeHandlers(view, event.nativeEvent, "search-panel")) {
      event.preventDefault()
    }
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.shiftKey ? findPrevious(view) : findNext(view)
    }
  }

  const handleReplaceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.metaKey || event.ctrlKey ? replaceAll(view) : replaceNext(view)
    }
  }

  const hasQuery = search.length > 0
  const isInvalid = hasQuery && !query.valid

  const matchLabel = !hasQuery
    ? ""
    : isInvalid
      ? "Invalid"
      : matches.total === 0
        ? "No results"
        : `${matches.current || "?"} of ${matches.total}${matches.capped ? "+" : ""}`

  return (
    <div className="CodeMirrorSearchPanel" onKeyDown={handleKeyDown}>
      <PanelButton
        className="CodeMirrorSearchPanel-expand"
        icon={replaceOpen ? Icons.ChevronDown : Icons.ChevronRight}
        tooltip={replaceOpen ? "Hide Replace" : "Show Replace"}
        onClick={() => { setReplaceOpen(!replaceOpen) }}
      />

      <div className="CodeMirrorSearchPanel-rows">
        <div className="CodeMirrorSearchPanel-row">
          <div className={`CodeMirrorSearchPanel-field ${isInvalid ? "is-invalid" : ""}`}>
            <Icons.Search size={13} className="CodeMirrorSearchPanel-field-icon" />
            <input
              {...mainFieldAttribute}
              className="CodeMirrorSearchPanel-input"
              placeholder="Find"
              aria-label="Find"
              spellCheck={false}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                commit({ search: event.target.value })
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <ToggleButton
              icon={Icons.MatchCase}
              tooltip="Match Case"
              active={query.caseSensitive}
              onClick={() => { commit({ caseSensitive: !query.caseSensitive }) }}
            />
            <ToggleButton
              icon={Icons.MatchWholeWord}
              tooltip="Match Whole Word"
              active={query.wholeWord}
              onClick={() => { commit({ wholeWord: !query.wholeWord }) }}
            />
            <ToggleButton
              icon={Icons.Regex}
              tooltip="Use Regular Expression"
              active={query.regexp}
              onClick={() => { commit({ regexp: !query.regexp }) }}
            />
          </div>

          <span className={`CodeMirrorSearchPanel-count ${hasQuery && matches.total === 0 ? "is-empty" : ""}`}>
            {matchLabel}
          </span>

          <div className="CodeMirrorSearchPanel-actions">
            <PanelButton
              icon={Icons.ArrowUp}
              tooltip="Previous Match (Shift+Enter)"
              disabled={matches.total === 0}
              onClick={() => { findPrevious(view) }}
            />
            <PanelButton
              icon={Icons.ArrowDown}
              tooltip="Next Match (Enter)"
              disabled={matches.total === 0}
              onClick={() => { findNext(view) }}
            />
            <PanelButton
              icon={Icons.Close}
              tooltip="Close (Escape)"
              onClick={() => { closeSearchPanel(view) }}
            />
          </div>
        </div>

        {replaceOpen && (
          <div className="CodeMirrorSearchPanel-row">
            <div className="CodeMirrorSearchPanel-field">
              <Icons.Replace size={13} className="CodeMirrorSearchPanel-field-icon" />
              <input
                className="CodeMirrorSearchPanel-input"
                placeholder="Replace"
                aria-label="Replace"
                spellCheck={false}
                value={replace}
                onChange={(event) => {
                  setReplace(event.target.value)
                  commit({ replace: event.target.value })
                }}
                onKeyDown={handleReplaceKeyDown}
              />
            </div>

            <div className="CodeMirrorSearchPanel-actions CodeMirrorSearchPanel-replace-actions">
              <PanelButton
                icon={Icons.Replace}
                tooltip="Replace (Enter)"
                disabled={matches.total === 0 || state.readOnly}
                onClick={() => { replaceNext(view) }}
              />
              <PanelButton
                icon={Icons.ReplaceAll}
                tooltip={`Replace All (${isMacOS ? "⌘" : "Ctrl+"}Enter)`}
                disabled={matches.total === 0 || state.readOnly}
                onClick={() => { replaceAll(view) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PanelButtonProps {
  icon: IconType
  tooltip: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

// Keep focus in the input while clicking, so Enter keeps working afterwards
const keepFocus = (event: MouseEvent) => { event.preventDefault() }

const PanelButton: FC<PanelButtonProps> = ({ icon: Icon, tooltip, onClick, disabled, className = "" }) => (
  <Tooltip overlay={tooltip}>
    <button
      type="button"
      className={`CodeMirrorSearchPanel-button ${className}`}
      aria-label={tooltip}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      <Icon size={14} />
    </button>
  </Tooltip>
)

const ToggleButton: FC<PanelButtonProps & { active: boolean }> = ({ icon: Icon, tooltip, onClick, active }) => (
  <Tooltip overlay={tooltip}>
    <button
      type="button"
      className={`CodeMirrorSearchPanel-toggle ${active ? "is-active" : ""}`}
      aria-label={tooltip}
      aria-pressed={active}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      <Icon size={14} />
    </button>
  </Tooltip>
)
