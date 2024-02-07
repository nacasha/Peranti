import "src/services/user-settings-service"

export const withUserSettingStore = (component: () => React.ReactNode) => () => {
  return component()
}
