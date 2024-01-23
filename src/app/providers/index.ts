import compose from "compose-function"

import { withBootstrap } from "./withBootstrap.js"
import { withPlugins } from "./withPlugins.js"

export const withProviders = compose(
  withBootstrap,
  withPlugins
)
