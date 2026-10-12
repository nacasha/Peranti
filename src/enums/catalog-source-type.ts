export enum CatalogSourceType {
  GitHub = "github",
  GitLab = "gitlab",

  /**
   * Gitea and its forks, Forgejo and Codeberg
   */
  Gitea = "gitea",

  /**
   * An `index.json` on any static host, files are next to it
   */
  Url = "url",

  /**
   * A folder on this computer, read directly without an `index.json`
   */
  Local = "local",
}
