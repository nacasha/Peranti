class GlobalStyleVariables {
  set(key: string, value: string) {
    document.body.style.setProperty(key, value)
  }
}

export const globalStyleVariables = new GlobalStyleVariables()
