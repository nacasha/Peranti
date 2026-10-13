import { CatalogSourceType } from "src/enums/catalog-source-type"

export const CatalogSourceTypeLabels: Record<CatalogSourceType, string> = {
  [CatalogSourceType.GitHub]: "GitHub",
  [CatalogSourceType.GitLab]: "GitLab",
  [CatalogSourceType.Gitea]: "Gitea",
  [CatalogSourceType.Local]: "Local Folder"
}
