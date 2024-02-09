import { useHotkeys } from "react-hotkeys-hook"

export function useHotkeysModified(...args: Parameters<typeof useHotkeys>) {
  args[2] = {
    ...(args[2] ?? {}),
    enableOnFormTags: ["input", "textarea", "select"],
    enableOnContentEditable: true
  }

  useHotkeys(...args)
}
