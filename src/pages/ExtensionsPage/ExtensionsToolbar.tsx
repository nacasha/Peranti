import { type FC, type ReactNode } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { Icons } from "src/constants/icons"

export const ALL_SOURCES = "all"

interface ExtensionsToolbarProps {
  keyword: string
  onKeywordChange: (keyword: string) => void
  sourceFilter: string
  onSourceFilterChange: (sourceFilter: string) => void

  /**
   * Sources to pick from, "All Sources" is added in front
   */
  sourceOptions: Array<{ label: string, value: string }>
  children?: ReactNode
}

/**
 * Search input and source picker above an extension list
 */
export const ExtensionsToolbar: FC<ExtensionsToolbarProps> = ({
  keyword,
  onKeywordChange,
  sourceFilter,
  onSourceFilterChange,
  sourceOptions,
  children
}) => (
  <>
    <div className="ExtensionsPage-search">
      <Icons.Search size={13} aria-hidden />
      <input
        placeholder="Search extensions"
        value={keyword}
        onChange={(event) => { onKeywordChange(event.target.value) }}
        autoComplete="off"
      />
    </div>

    <Dropdown
      width="100%"
      value={sourceFilter}
      onChange={onSourceFilterChange}
      options={[{ label: "All Sources", value: ALL_SOURCES }, ...sourceOptions]}
    />

    {children}
  </>
)
