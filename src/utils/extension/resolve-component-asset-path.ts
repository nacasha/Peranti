/**
 * Path of a file a component's HTML links, relative to the component folder.
 * `href` is read relative to the HTML file, like a browser does, so a build
 * in a `dist` folder can link `./assets/index.js`. Undefined for a link to
 * another site, an absolute path, or one leaving the component folder.
 */
export function resolveComponentAssetPath(entry: string, href: string | null): string | undefined {
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("/") || href.includes("\\")) {
    return undefined
  }

  const segments = entry.split("/").slice(0, -1)

  for (const segment of href.split(/[?#]/)[0].split("/")) {
    if (segment === "" || segment === ".") continue

    if (segment === "..") {
      if (segments.length === 0) return undefined
      segments.pop()
    } else {
      segments.push(segment)
    }
  }

  return segments.length > 0 ? segments.join("/") : undefined
}
