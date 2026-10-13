import { EXTENSION_PAGE_APPLET_PREFIX } from "src/constants/extension-page"
import { Icons, type Icon } from "src/constants/icons"
import { AppletType } from "src/enums/applet-type"
import { appletStore } from "src/services/applet-store"
import { type Session } from "src/types/Session"

const PAGE_ICONS: Record<string, Icon> = {
  "settings-page": Icons.Gear,
  "history-page": Icons.History,
  "extensions-page": Icons.Extensions,
  "workbench-page": Icons.Manage,
  "pipeline-editor": Icons.ThreeLineVertical
}

/**
 * Icon shown on a session tab, by what the session holds: a known page,
 * an extension page, a pipeline, or otherwise a tool
 */
export function getSessionIcon(session: Session): Icon {
  const { appletId } = session

  if (appletId.startsWith(EXTENSION_PAGE_APPLET_PREFIX)) return Icons.Extensions
  if (PAGE_ICONS[appletId]) return PAGE_ICONS[appletId]

  const type = appletStore.mapOfLoadedApplets[appletId]?.type
  if (type === AppletType.Pipeline) return Icons.ThreeLineVertical
  if (type === AppletType.Extension) return Icons.Extension
  return Icons.Tool
}
