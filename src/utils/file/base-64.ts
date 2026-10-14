const BASE64_MARKER = ";base64,"

export function removeBase64Header(base64Uri: string) {
  const base64Index = base64Uri.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  return base64Uri.substring(base64Index)
}
