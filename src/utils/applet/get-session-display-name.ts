import { appletStore } from "src/services/applet-store"
import { type Session } from "src/types/Session"

/**
 * Label shown for a session tab: its custom name, or "<Tool>-<sequence>"
 */
export function getSessionDisplayName(session: Session) {
  const { sessionName, sessionSequenceNumber, appletId } = session

  if (sessionName) return sessionName
  return appletStore.mapOfLoadedAppletsName[appletId]?.concat(`-${sessionSequenceNumber}`)
}
