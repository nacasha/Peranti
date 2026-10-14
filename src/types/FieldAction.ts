/**
 * A button in a field's header, next to Copy and Maximize. Set on a field
 * with `actions` in a tool, or by an extension component at runtime with
 * `peranti.setActions`.
 *
 * The id `run` is Peranti's own: it runs the tool, like Regenerate, and is
 * disabled while the tool runs. Any other id is handed to the field's
 * extension component, through `peranti.onAction`.
 */
export interface FieldAction {
  id: string

  /**
   * Text on the button. Without it the button is the icon alone
   */
  label?: string

  /**
   * Name of an icon in `Icons`, such as "Run", "Copy" or "Download"
   */
  icon?: string

  /**
   * Shown on hover, the label is used when left out
   */
  tooltip?: string

  /**
   * Drawn as a toggle that is on, like Batch when batch mode is on
   */
  active?: boolean

  disabled?: boolean
}

export const RUN_FIELD_ACTION = "run"

/** More would crowd the header out of its label */
export const MAX_FIELD_ACTIONS = 4

/**
 * Keeps the well-formed actions of an untrusted list, such as one from a
 * tool's JSON or a component frame
 */
export function sanitizeFieldActions(actions: unknown): FieldAction[] {
  if (!Array.isArray(actions)) {
    return []
  }

  const text = (value: unknown, max: number) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined
  const seen = new Set<string>()

  return actions
    .filter((action): action is Record<string, unknown> => Boolean(action) && typeof action === "object")
    .map((action) => ({
      id: text(action.id, 64) ?? "",
      label: text(action.label, 32),
      icon: text(action.icon, 64),
      tooltip: text(action.tooltip, 120),
      active: action.active === true,
      disabled: action.disabled === true
    }))
    .filter((action) => {
      if (!action.id || seen.has(action.id) || (!action.label && !action.icon)) {
        return false
      }
      seen.add(action.id)
      return true
    })
    .slice(0, MAX_FIELD_ACTIONS)
}
