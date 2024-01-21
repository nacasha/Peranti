import { useHotkeys } from "react-hotkeys-hook"

export function useHotkeysModified(...args: Parameters<typeof useHotkeys>) {
  /**
   * Set default options for every hotkeys hook
   * Allow hotkeys to be triggered even when focusing on input fields
   */
  args[2] = {
    ...(args[2] ?? {}),
    enableOnFormTags: ["input", "textarea"],
    enableOnContentEditable: true
  }

  useHotkeys(...args)
}
