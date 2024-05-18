class GlobalStyles {
  /**
   * Set global styles of application
   *
   * @param key
   * @param value
   */
  setVariable(key: string, value: string) {
    document.body.style.setProperty(key, value)
  }
}

export const globalStyles = new GlobalStyles()
