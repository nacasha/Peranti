import { observer } from "mobx-react"
import { type FC } from "react"

import { Icons } from "src/constants/icons"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { type CatalogSource } from "src/types/CatalogSource"
import { getCatalogSourceLabel } from "src/utils/get-catalog-source-label"

interface CatalogSourceErrorNoticeProps {
  source: CatalogSource
  error: string
  onManageSources: () => void
}

/**
 * A catalog source that failed to load, above the extension list, with a
 * retry for only that source
 */
export const CatalogSourceErrorNotice: FC<CatalogSourceErrorNoticeProps> = observer(({ source, error, onManageSources }) => {
  const isRetrying = !!extensionCatalogService.sourceStates[source.id]?.isLoading

  const handleRetry = () => {
    void extensionCatalogService.loadSource(source, true)
  }

  return (
    <div className="CatalogSourceErrorNotice" role="alert">
      <Icons.Warning size={14} aria-hidden className="CatalogSourceErrorNotice-icon" />

      <div className="CatalogSourceErrorNotice-main">
        <div className="CatalogSourceErrorNotice-title">
          Couldn&apos;t load <strong>{getCatalogSourceLabel(source)}</strong>
        </div>
        <div className="CatalogSourceErrorNotice-message" title={error}>{error}</div>

        <div className="CatalogSourceErrorNotice-actions">
          <button type="button" disabled={isRetrying} onClick={handleRetry}>
            <Icons.Refresh size={12} aria-hidden />
            {isRetrying ? "Retrying…" : "Retry"}
          </button>
          <button type="button" onClick={onManageSources}>
            <Icons.Settings size={12} aria-hidden />
            Sources
          </button>
        </div>
      </div>
    </div>
  )
})
