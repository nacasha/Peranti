import { useEffect, useState, type CSSProperties, type FC } from "react"

import { Icons } from "src/constants/icons"
import { formatFileSize } from "src/utils/format-file-size"
import { getExtensionHue } from "src/utils/get-extension-hue"
import { getFileExtension } from "src/utils/get-file-extension"
import { isImageFile } from "src/utils/is-image-file"

interface FileInputItemProps {
  file: File
  onRemove: () => void
  onReplace?: () => void
}

/**
 * One selected file: an image thumbnail or a tinted extension badge, the name
 * and size, then the row actions. Key it by file so the preview URL never
 * outlives the file it was made for.
 */
export const FileInputItem: FC<FileInputItemProps> = (props) => {
  const { file, onRemove, onReplace } = props
  const [previewUrl, setPreviewUrl] = useState<string>()

  const extension = getFileExtension(file.name)
  const isImage = isImageFile(file)
  const badgeStyle: CSSProperties & Record<"--badge-hue", number> = { "--badge-hue": getExtensionHue(extension) }

  useEffect(() => {
    if (!isImage) {
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => { URL.revokeObjectURL(url) }
  }, [file, isImage])

  return (
    <li className="FileInput-item" title={file.name}>
      {previewUrl
        ? <img className="FileInput-item-thumb" src={previewUrl} alt="" />
        : (
          <span className="FileInput-item-badge" style={badgeStyle}>
            {(extension || "file").slice(0, 4).toUpperCase()}
          </span>
        )}

      <span className="FileInput-item-info">
        <span className="FileInput-item-name">{file.name}</span>
        <span className="FileInput-item-size">{formatFileSize(file.size)}</span>
      </span>

      {onReplace && (
        <button type="button" className="FileInput-item-replace" onClick={onReplace}>
          Replace
        </button>
      )}

      <button
        type="button"
        className="FileInput-item-remove"
        aria-label={`Remove ${file.name}`}
        title="Remove"
        onClick={onRemove}
      >
        <Icons.Close size={14} aria-hidden />
      </button>
    </li>
  )
}
