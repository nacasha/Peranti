import "simplebar-react/dist/simplebar.min.css"

export const withPlugins = (component: () => React.ReactNode) => () => {
  return component()
}
