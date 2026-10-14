const UNITS = ["B", "KB", "MB", "GB", "TB"]

/**
 * Formats a byte count into a short human readable label, e.g. "1.4 MB".
 * Values below 1 KB stay whole numbers because "0.4 KB" reads worse than "412 B".
 */
export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return ""
  }

  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < UNITS.length - 1) {
    size = size / 1024
    unitIndex = unitIndex + 1
  }

  const rounded = unitIndex === 0 ? String(size) : size.toFixed(size >= 10 ? 0 : 1)

  return `${rounded} ${UNITS[unitIndex]}`
}
