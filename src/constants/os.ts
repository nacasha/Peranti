const platform = typeof navigator !== "undefined" ? navigator.platform.toLowerCase() : ""
const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : ""

export const isMacOS = platform.includes("mac") || userAgent.includes("mac os")
export const isWindows = platform.includes("win") || userAgent.includes("windows")
export const isLinux = !isMacOS && !isWindows
