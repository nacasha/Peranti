export const Folders = {
  /** Where settings, snippets and extensions live, inside the home folder */
  UserData: ".peranti",

  Extensions: "extensions",

  /**
   * Where an extension is downloaded before it is moved into the extensions
   * folder, so a half-finished install is never loaded. Not a dot folder:
   * the fs scope's `**` doesn't match hidden folders on Unix.
   */
  ExtensionInstalls: "extension-installs"
}
