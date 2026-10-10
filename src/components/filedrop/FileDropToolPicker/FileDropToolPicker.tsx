import Fuse from "fuse.js"
import { Fragment, useEffect, useMemo, useRef, useState, type FC, type KeyboardEvent } from "react"
import SimpleBar from "simplebar-react"

import { Icons } from "src/constants/icons"
import { type RankedAppletFileTarget } from "src/services/applet-file-support-service"

import "./FileDropToolPicker.scss"

interface FileDropToolPickerProps {
  /** Tools ranked for the file about to be opened. */
  targets: RankedAppletFileTarget[]
  /** What the picked tool will open: one file name, or "3 files". */
  subject: string
  /** Set when more than one file was dropped, to offer the all-files toggle. */
  allFilesCount?: number
  isAllFiles?: boolean
  onToggleAllFiles?: () => void
  onSelect: (appletId: string) => void
}

export const FileDropToolPicker: FC<FileDropToolPickerProps> = (props) => {
  const { targets, subject, allFilesCount, isAllFiles, onToggleAllFiles, onSelect } = props

  const [searchKeyword, setSearchKeyword] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(() => new Fuse(targets, {
    keys: ["applet.name", "applet.category", "applet.description"]
  }), [targets])

  // Fuse reorders by its own score, which would throw away the extension
  // ranking, so searching only narrows the list — the order stays as ranked.
  const visibleTargets = useMemo(() => {
    if (searchKeyword.trim().length === 0) {
      return targets
    }

    const matchedIds = new Set(fuse.search(searchKeyword).map((result) => result.item.applet.appletId))
    return targets.filter((target) => matchedIds.has(target.applet.appletId))
  }, [searchKeyword, targets, fuse])

  const suggestedTargets = visibleTargets.filter((target) => target.isFullMatch)
  const otherTargets = visibleTargets.filter((target) => !target.isFullMatch)

  // Suggested tools come first on screen, so keyboard order follows the same split
  const orderedTargets = [...suggestedTargets, ...otherTargets]

  useEffect(() => {
    setActiveIndex(0)
  }, [searchKeyword])

  useEffect(() => {
    listRef.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, searchKeyword])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), orderedTargets.length - 1))
    } else if (event.key === "Enter" && orderedTargets[activeIndex]) {
      event.preventDefault()
      onSelect(orderedTargets[activeIndex].applet.appletId)
    }
  }

  const renderTarget = (target: RankedAppletFileTarget) => (
    <button
      key={target.applet.appletId}
      type="button"
      className="FileDropToolPicker-item"
      data-active={orderedTargets[activeIndex] === target || undefined}
      onMouseMove={() => { setActiveIndex(orderedTargets.indexOf(target)) }}
      onClick={() => { onSelect(target.applet.appletId) }}
    >
      {target.applet.name}
      {target.isActiveApplet && (
        <span className="FileDropToolPicker-item-tag">current</span>
      )}
    </button>
  )

  const renderSection = (label: string, sectionTargets: RankedAppletFileTarget[]) => (
    <Fragment key={label}>
      <div className="FileDropToolPicker-section">{label}</div>
      {sectionTargets.map(renderTarget)}
    </Fragment>
  )

  return (
    <div className="FileDropToolPicker">
      <div className="FileDropToolPicker-label">
        <span className="FileDropToolPicker-label-text">
          Open <strong>{subject}</strong> with
        </span>

        {allFilesCount !== undefined && allFilesCount > 1 && (
          <button
            type="button"
            className="FileDropToolPicker-all"
            aria-pressed={!!isAllFiles}
            onClick={onToggleAllFiles}
          >
            {isAllFiles ? <Icons.Check size={12} aria-hidden /> : null}
            Use for all {allFilesCount} files
          </button>
        )}
      </div>

      <label className="FileDropToolPicker-search">
        <Icons.Search size={14} aria-hidden />
        <input
          type="text"
          value={searchKeyword}
          placeholder="Search tools"
          spellCheck={false}
          autoComplete="off"
          autoFocus
          onKeyDown={handleKeyDown}
          onChange={(event) => { setSearchKeyword(event.target.value) }}
        />
      </label>

      <SimpleBar className="FileDropToolPicker-list">
        <div ref={listRef}>
          {orderedTargets.length === 0 && (
            <div className="FileDropToolPicker-empty">No tool matches “{searchKeyword}”</div>
          )}

          {suggestedTargets.length > 0 && renderSection("Suggested", suggestedTargets)}
          {otherTargets.length > 0 && renderSection("All tools", otherTargets)}
        </div>
      </SimpleBar>
    </div>
  )
}
