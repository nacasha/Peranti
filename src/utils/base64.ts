const BASE64_MARKER = ";base64,"

export function isBase64URI(str: string) {
  try {
    return str.startsWith("data:") && str.includes(";base64,")
  } catch (err) {
    return false
  }
}

export function base64Only(base64Uri: string) {
  const base64Index = base64Uri.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  return base64Uri.substring(base64Index)
}

export function base64ToUint8Array(base64String: string) {
  const raw = window.atob(base64Only(base64String))
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}
