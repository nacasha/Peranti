/**
 * A message between the app and a component frame, or the frame's console
 * output, as the component playground shows it
 */
export interface ExtensionComponentDebugEvent {
  /**
   * "out" is from the app to the frame, "in" from the frame to the app
   */
  direction: "in" | "out"
  type: string
  data: Record<string, unknown>
}
