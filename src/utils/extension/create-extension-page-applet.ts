import { EXTENSIONS_CATEGORY } from "src/constants/extension-catalog"
import { EXTENSION_PAGE_APPLET_PREFIX } from "src/constants/extension-page"
import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

/**
 * Page showing one extension, installed or in a catalog. Its applet ID is
 * made from the extension ID, so opening it again finds the same tab.
 */
export function createExtensionPageApplet(extensionId: string, name: string): AppletConstructor {
  return new AppletConstructor({
    appletId: `${EXTENSION_PAGE_APPLET_PREFIX}${extensionId}`,
    // Tells its tab apart from a tool of the same name
    name: `Extensions: ${name}`,
    category: EXTENSIONS_CATEGORY,
    inputFields: [
      {
        key: "content",
        label: "content",
        customComponent: true,
        component: "ExtensionPage",
        props: { extensionId }
      }
    ],
    outputFields: [],
    disableMultipleSession: true,
    hideOnSidebar: true,
    type: AppletType.Page
  })
}
