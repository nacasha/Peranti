/**
 * Trims a directory from the left, keeping the tail that actually identifies
 * where the file lives ("…/Documents/invoices" beats "/Users/someone/Doc…").
 */
export function shortenDirectoryPath(directory: string, maxLength: number = 44) {
  if (directory.length <= maxLength) {
    return directory
  }

  return `…${directory.slice(directory.length - maxLength)}`
}
