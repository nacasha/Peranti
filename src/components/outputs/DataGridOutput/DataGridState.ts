import { type GridSelection } from "@glideapps/glide-data-grid"

/**
 * Serializable DataGrid state kept by the applet, so it survives unmounting (e.g. tab change)
 */
export interface DataGridState {
  /**
   * Column widths keyed by column position, not id (ids change with the data, e.g. header toggled)
   */
  widths: Record<number, number>
  scroll: { left: number, top: number }
  selection?: {
    current?: GridSelection["current"]
    columns: number[]
    rows: number[]
  }
}
