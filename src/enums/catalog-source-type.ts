export enum CatalogSourceType {
  GitHub = "github",
  GitLab = "gitlab",

  /**
   * Gitea and its forks, Forgejo and Codeberg
   */
  Gitea = "gitea",

  /**
   * A folder on this computer, read in place
   */
  Local = "local",
}
