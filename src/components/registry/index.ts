import { appletComponentService } from "src/services/applet-component-service"

import { inputComponents } from "./input-components.js"
import { outputComponents } from "./output-components.js"
import { pageComponents } from "./page-components.js"

/**
 * Hands the built-in components to `appletComponentService`.
 *
 * The service is used by models and stores, while the components import those
 * same stores. Registering from here, instead of the service importing the
 * components, keeps the service free of UI imports and out of import cycles.
 */
export function registerBuiltInComponents() {
  appletComponentService.register({
    inputs: inputComponents,
    outputs: outputComponents,
    pages: pageComponents
  })
}
