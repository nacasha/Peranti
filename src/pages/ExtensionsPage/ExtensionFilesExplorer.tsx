import { clsx } from "clsx"
import { useEffect, useMemo, useState, type FC, type ReactNode } from "react"

import { BaseCodeMirror } from "src/components/common/BaseCodeMirror"
import { FileNames } from "src/constants/file-names"
import { Icons } from "src/constants/icons"
import { usePageState } from "src/hooks/usePageState"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type FileTreeNode } from "src/types/FileTreeNode"
import { buildFileTree } from "src/utils/file/build-file-tree"
import { decodePreviewText } from "src/utils/file/decode-preview-text"
import { formatFileSize } from "src/utils/file/format-file-size"
import { getCodeLanguage } from "src/utils/file/get-code-language"

/**
 * Bigger files aren't previewed, the editor slows down and remote ones would
 * be downloaded only to look at them
 */
const MAX_PREVIEW_BYTES = 1024 * 1024

type Preview =
  | { status: "loading" }
  | { status: "text", text: string }
  | { status: "binary" }
  | { status: "too-large" }
  | { status: "error", message: string }

interface ExtensionFilesExplorerProps {
  files?: CatalogExtensionFile[]

  /**
   * Shown instead of the explorer while files are listed or when they can't be
   */
  placeholder?: string
  readFile: (file: CatalogExtensionFile) => Promise<Uint8Array>
}

/**
 * Files of an extension on the left, the picked one's code on the right
 */
export const ExtensionFilesExplorer: FC<ExtensionFilesExplorerProps> = ({ files, placeholder, readFile }) => {
  const [selectedPath, setSelectedPath] = usePageState<string | undefined>("files.selected", undefined)
  const [preview, setPreview] = useState<Preview>({ status: "loading" })
  // Kept as a list, so the page can save it with its tab
  const [collapsedList, setCollapsedList] = usePageState<string[]>("files.collapsed", [])
  const collapsedPaths = useMemo(() => new Set(collapsedList), [collapsedList])
  const tree = useMemo(() => buildFileTree(files ?? []), [files])

  // Opens on the manifest, the file that says what the extension does
  const selected = files?.find((file) => file.path === selectedPath) ??
    files?.find((file) => file.path === FileNames.ExtensionDefinition) ??
    files?.[0]

  useEffect(() => {
    if (!selected) {
      return
    }

    if ((selected.size ?? 0) > MAX_PREVIEW_BYTES) {
      setPreview({ status: "too-large" })
      return
    }

    let isCurrent = true
    setPreview({ status: "loading" })

    readFile(selected)
      .then((bytes) => {
        if (!isCurrent) return
        const text = decodePreviewText(bytes)
        setPreview(text === undefined ? { status: "binary" } : { status: "text", text })
      })
      .catch((exception: unknown) => {
        if (!isCurrent) return
        setPreview({ status: "error", message: exception instanceof Error ? exception.message : String(exception) })
      })

    return () => { isCurrent = false }
  }, [selected?.path])

  if (!files || files.length === 0) {
    return (
      <div className="ExtensionFiles-empty">
        {files ? "This extension has no files" : placeholder}
      </div>
    )
  }

  const renderPreview = () => {
    switch (preview.status) {
    case "loading": return <div className="ExtensionFiles-message">Loading…</div>
    case "too-large": return <div className="ExtensionFiles-message">Too large to preview ({formatFileSize(selected?.size ?? 0)})</div>
    case "binary": return <div className="ExtensionFiles-message">Binary file, no preview</div>
    case "error": return <div className="ExtensionFiles-message is-error">{preview.message}</div>
    case "text": return (
      <BaseCodeMirror
        value={preview.text}
        language={getCodeLanguage(selected?.path ?? "")}
        editable={false}
        readOnly
      />
    )
    }
  }

  const toggleFolder = (path: string) => {
    setCollapsedList(collapsedPaths.has(path)
      ? collapsedList.filter((item) => item !== path)
      : [...collapsedList, path])
  }

  // Indented by depth, folders open until collapsed
  const renderNodes = (nodes: FileTreeNode[], depth: number): ReactNode => nodes.map((node) => {
    const indent = { paddingLeft: 8 + depth * 14 }

    if (node.children) {
      const isOpen = !collapsedPaths.has(node.path)

      return (
        <li key={node.path} role="treeitem" aria-expanded={isOpen}>
          <button
            type="button"
            className="ExtensionFiles-item is-folder"
            style={indent}
            title={node.path}
            onClick={() => { toggleFolder(node.path) }}
          >
            {isOpen ? <Icons.ChevronDown size={12} aria-hidden /> : <Icons.ChevronRight size={12} aria-hidden />}
            {isOpen ? <Icons.FolderOpen size={13} aria-hidden /> : <Icons.Folder size={13} aria-hidden />}
            <span className="ExtensionFiles-item-name">{node.name}</span>
          </button>
          {isOpen && <ul role="group">{renderNodes(node.children, depth + 1)}</ul>}
        </li>
      )
    }

    const file = node.file!

    return (
      <li key={node.path} role="treeitem" aria-selected={file === selected}>
        <button
          type="button"
          className={clsx("ExtensionFiles-item", file === selected && "is-selected")}
          // Lines up with folder names, past the chevron
          style={{ paddingLeft: 8 + depth * 14 + 19 }}
          title={node.path}
          onClick={() => { setSelectedPath(file.path) }}
        >
          <Icons.File size={13} aria-hidden />
          <span className="ExtensionFiles-item-name">{node.name}</span>
          {file.size !== undefined && <span className="ExtensionFiles-item-size">{formatFileSize(file.size)}</span>}
        </button>
      </li>
    )
  })

  return (
    <div className="ExtensionFiles">
      <ul className="ExtensionFiles-list" role="tree">
        {renderNodes(tree, 0)}
      </ul>

      <div className="ExtensionFiles-viewer">
        {selected && (
          <div className="ExtensionFiles-viewer-header">
            <code>{selected.path}</code>
            {selected.executable && <span className="ExtensionDetails-chip">executable</span>}
            {selected.size !== undefined && <span className="ExtensionFiles-viewer-size">{formatFileSize(selected.size)}</span>}
          </div>
        )}
        <div className="ExtensionFiles-viewer-body">
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}
