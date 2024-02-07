import compose from "compose-function"

import { withMobxStore } from "./withMobxStore.ts"
import { withProductionSetup } from "./withProductionSetup.ts"
import { withReactHotToast } from "./withReactHotToast.tsx"
import { withThemes } from "./withThemes.ts"
import { withUserSettingStore } from "./withUserSettingStore.ts"

export const withProviders = compose(
  withThemes,
  withMobxStore,
  withUserSettingStore,
  withProductionSetup,
  withReactHotToast
)
