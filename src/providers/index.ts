import compose from "compose-function"

import { withMobxStore } from "./with-mobx-store.ts"
import { withProductionSetup } from "./with-production-setup.ts"
import { withReactHotToast } from "./with-react-hot-toast.tsx"
import { withThemes } from "./with-themes.ts"
import { withUserSettingStore } from "./with-user-settings.ts"

export const withProviders = compose(
  withThemes,
  withMobxStore,
  withUserSettingStore,
  withProductionSetup,
  withReactHotToast
)
