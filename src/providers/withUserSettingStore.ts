import "src/stores/userSettingsStore"

export const withUserSettingStore = (component: () => React.ReactNode) => () => {
  return component()
}
