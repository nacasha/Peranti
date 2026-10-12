import { type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"

import "./ExtensionComponentMissing.scss"

interface ExtensionComponentMissingProps {
  fieldKey: string
  label?: string
}

/**
 * Stands in for an extension component that is no longer loaded, such as
 * after its extension was disabled while the tab stayed open
 */
export const ExtensionComponentMissing: FC<ExtensionComponentMissingProps> = ({ fieldKey, label }) => (
  <div className="ExtensionComponentMissing" style={{ gridArea: fieldKey }}>
    <AppletComponentHead label={label} />
    <div className="ExtensionComponentMissing-body">
      <Icons.Warning size={14} aria-hidden />
      This field&apos;s component isn&apos;t loaded. Reload extensions, or check the Extensions page.
    </div>
  </div>
)
