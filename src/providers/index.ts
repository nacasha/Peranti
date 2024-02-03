import compose from "compose-function"

import { withAppBootstrap } from "./withAppBootstrap.ts"
import { withPluginsSetup } from "./withPluginsSetup.ts"

export const withProviders = compose(
  withAppBootstrap,
  withPluginsSetup
)
