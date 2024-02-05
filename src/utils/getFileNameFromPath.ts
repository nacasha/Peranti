export function getFileNameFromPath(path: string) {
  return path.replace(/^.*[\\/]/, "")
}
