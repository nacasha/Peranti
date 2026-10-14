import { scan } from "react-scan"

/**
 * React Scan is a development-only tool that highlights components as they
 * re-render. This module is injected into index.html by a Vite plugin that
 * only exists while the dev server runs (`apply: "serve"`), so neither this
 * module nor the react-scan package ever reaches a production bundle.
 *
 * The import is static (not dynamic) so react-scan is fully initialised
 * before main.tsx executes — main.tsx renders synchronously during module
 * evaluation, so a dynamic import would resolve too late to instrument the
 * first render.
 */
if (import.meta.env.DEV) {
  scan({ enabled: true })
}
