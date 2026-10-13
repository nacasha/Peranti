import { type FileDropZone } from "src/types/FileDropZone"

/**
 * Finds the drop zone under a point (in CSS pixels). Drop zones mark themselves
 * with `data-file-drop-zone="field"` and `data-file-drop-id`, because the
 * Tauri webview reports file drags as window events with a position only, so
 * the browser can't tell us which element is being hovered.
 */
export function getFileDropZoneAtPoint(x: number, y: number): FileDropZone | undefined {
  for (const element of document.elementsFromPoint(x, y)) {
    const zoneElement = element.closest<HTMLElement>("[data-file-drop-zone]")
    const { fileDropZone, fileDropId } = zoneElement?.dataset ?? {}

    if (fileDropId !== undefined && fileDropZone === "field") {
      return { type: "field", id: fileDropId }
    }
  }
}
