import Fuse from "fuse.js"
import { useMemo, useState, type FC } from "react"

import { type RankedAppletFileTarget } from "src/services/applet-file-support-service"

import "./FileDropToolPicker.scss"

interface FileDropToolPickerProps {
  targets: RankedAppletFileTarget[]
  /** Shown beside the label to say what picking a tool will do. */
  hint?: string
  onSelect: (appletId: string) => void
}

export const FileDropToolPicker: FC<FileDropToolPickerProps> = (props) => {
  const { targets, hint, onSelect } = props

  const [searchKeyword, setSearchKeyword] = useState("")

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

  return (
    <div className="FileDropToolPicker">
      <div className="FileDropToolPicker-header">
        <span className="FileDropToolPicker-label">
          Open with
          {hint && <span className="FileDropToolPicker-hint">{hint}</span>}
        </span>
        <input
          className="FileDropToolPicker-search"
          type="text"
          value={searchKeyword}
          placeholder="Search tools"
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => { setSearchKeyword(event.target.value) }}
        />
      </div>

      <div className="FileDropToolPicker-list">
        {visibleTargets.length === 0 && (
          <div className="FileDropToolPicker-empty">No tool matches “{searchKeyword}”</div>
        )}

        {visibleTargets.map((target) => (
          <button
            key={target.applet.appletId}
            type="button"
            className="FileDropToolPicker-item"
            data-match={target.isFullMatch ? "full" : undefined}
            onClick={() => { onSelect(target.applet.appletId) }}
          >
            <span className="FileDropToolPicker-item-text">
              <span className="FileDropToolPicker-item-name">
                {target.applet.name}
                {target.isActiveApplet && (
                  <span className="FileDropToolPicker-item-tag">current</span>
                )}
              </span>
              <span className="FileDropToolPicker-item-category">{target.applet.category}</span>
            </span>

            {target.matchedExtensions.length > 0 && (
              <span className="FileDropToolPicker-item-match">
                {target.matchedExtensions.map((extension) => `.${extension}`).join(" ")}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
