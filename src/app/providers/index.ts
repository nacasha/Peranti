import compose from "compose-function"

import { withAppBootstrap } from "./withAppBootstrap.js"
import { withPluginsSetup } from "./withPluginsSetup.js"

export const withProviders = compose(
  withAppBootstrap,
  withPluginsSetup
)
