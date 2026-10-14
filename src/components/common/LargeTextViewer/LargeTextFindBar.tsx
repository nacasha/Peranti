import { type FC, type KeyboardEvent, type MouseEvent } from "react"

import { Icons, type Icon as IconType } from "src/constants/icons"

// Same look as the editor's find panel
import "../CodeMirrorSearchPanel/CodeMirrorSearchPanel.scss"
import { Tooltip } from "../Tooltip"

interface LargeTextFindBarProps {
  query: string
  caseSensitive: boolean
  matchIndex: number
  matchCount: number
  isCapped: boolean
  onQueryChange: (query: string) => void
  onCaseSensitiveChange: (caseSensitive: boolean) => void
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
}

/**
 * Find bar of the large text viewer, styled like the editor's find panel
 */
export const LargeTextFindBar: FC<LargeTextFindBarProps> = (props) => {
  const {
    query,
    caseSensitive,
    matchIndex,
    matchCount,
    isCapped,
    onQueryChange,
    onCaseSensitiveChange,
    onNext,
    onPrevious,
    onClose
  } = props

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.shiftKey ? onPrevious() : onNext()
    } else if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    }
  }

  const hasQuery = query.length > 0
  const matchLabel = !hasQuery
    ? ""
    : matchCount === 0
      ? "No results"
      : `${matchIndex + 1 || "?"} of ${matchCount}${isCapped ? "+" : ""}`

  return (
    <div className="CodeMirrorSearchPanel LargeTextViewer-find">
      <div className="CodeMirrorSearchPanel-rows">
        <div className="CodeMirrorSearchPanel-row">
          <div className="CodeMirrorSearchPanel-field">
            <Icons.Search size={13} className="CodeMirrorSearchPanel-field-icon" />
            <input
              autoFocus
              className="CodeMirrorSearchPanel-input"
              placeholder="Find"
              aria-label="Find"
              spellCheck={false}
              value={query}
              onChange={(event) => { onQueryChange(event.target.value) }}
              onKeyDown={handleKeyDown}
              onFocus={(event) => { event.target.select() }}
            />
            <Tooltip overlay="Match Case">
              <button
                type="button"
                className={`CodeMirrorSearchPanel-toggle ${caseSensitive ? "is-active" : ""}`}
                aria-label="Match Case"
                aria-pressed={caseSensitive}
                onMouseDown={keepFocus}
                onClick={() => { onCaseSensitiveChange(!caseSensitive) }}
              >
                <Icons.MatchCase size={14} />
              </button>
            </Tooltip>
          </div>

          <span className={`CodeMirrorSearchPanel-count ${hasQuery && matchCount === 0 ? "is-empty" : ""}`}>
            {matchLabel}
          </span>

          <div className="CodeMirrorSearchPanel-actions">
            <FindButton icon={Icons.ArrowUp} tooltip="Previous Match (Shift+Enter)" disabled={matchCount === 0} onClick={onPrevious} />
            <FindButton icon={Icons.ArrowDown} tooltip="Next Match (Enter)" disabled={matchCount === 0} onClick={onNext} />
            <FindButton icon={Icons.Close} tooltip="Close (Escape)" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Keep focus in the input while clicking, so Enter keeps working afterwards
const keepFocus = (event: MouseEvent) => { event.preventDefault() }

interface FindButtonProps {
  icon: IconType
  tooltip: string
  onClick: () => void
  disabled?: boolean
}

const FindButton: FC<FindButtonProps> = ({ icon: Icon, tooltip, onClick, disabled }) => (
  <Tooltip overlay={tooltip}>
    <button
      type="button"
      className="CodeMirrorSearchPanel-button"
      aria-label={tooltip}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      <Icon size={14} />
    </button>
  </Tooltip>
)
