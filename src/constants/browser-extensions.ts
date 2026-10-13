/**
 * Extensions installed in the browser build, kept in IndexedDB since a
 * browser has no extensions folder
 */
export const BrowserExtensions = {
  /**
   * Folder paths of extensions kept in the browser start with this, so they
   * are told apart from paths on disk: `browser:/<folderName>/<file>`
   */
  pathPrefix: "browser:/",

  storeName: "browser-extensions"
}
