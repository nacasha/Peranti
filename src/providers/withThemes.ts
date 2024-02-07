import "src/styles/root.scss"

export const withThemes = (component: () => React.ReactNode) => () => {
  return component()
}
