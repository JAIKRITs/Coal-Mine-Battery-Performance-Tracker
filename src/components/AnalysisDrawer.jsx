import {
  formatAnalysisLabel,
  formatAnalysisTimestamp,
  formatLastUpdated,
  getFlagEntries,
  getSituationTone,
  getThreatTone,
} from "../utils/analysisPresentation.js";

function AnalysisBadge({ label, tone }) {
  return <span className={`analysis-badge analysis-tone--${tone}`}>{label}</span>;
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="analysis-drawer__empty-state">
      <div className="analysis-drawer__empty-icon" aria-hidden="true">
        <span />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {onAction ? (
        <button type="button" className="analysis-drawer__secondary-button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="analysis-drawer__loading-state" aria-hidden="true">
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--hero" />
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--line" />
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--line" />
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--line-short" />
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--panel" />
      <span className="analysis-drawer__skeleton analysis-drawer__skeleton--panel" />
    </div>
  );
}

export default function AnalysisDrawer({
  isOpen,
  analysis,
  hasAnalysis,
  isLoading,
  isRefreshing,
  error,
  lastFetchedAt,
  onClose,
  onRefresh,
}) {
  const situationTone = getSituationTone(analysis?.situation);
  const threatTone = getThreatTone(analysis?.threatLevel);
  const flagEntries = getFlagEntries(analysis?.flags);
  const hasAdvancedDetails = Boolean(analysis?.summary) || flagEntries.length > 0;
  const shouldShowLoading = isLoading && !hasAnalysis;
  const shouldShowError = !hasAnalysis && error;
  const shouldShowEmpty = !hasAnalysis && !isLoading && !error;

  return (
    <div
      className={`analysis-drawer-shell${isOpen ? " analysis-drawer-shell--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="analysis-drawer__backdrop"
        aria-label="Close environment analysis"
        onClick={onClose}
      />

      <aside
        className="analysis-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="analysis-drawer__header">
          <div>
            <span className="analysis-drawer__eyebrow">Live environmental intelligence</span>
            <h2 id="analysis-drawer-title">Environment Analysis</h2>
            <p className="analysis-drawer__subtitle">
              {hasAnalysis
                ? formatAnalysisTimestamp(analysis?.time)
                : "Latest 5-minute analysis snapshot"}
            </p>
          </div>

          <button
            type="button"
            className="analysis-drawer__close-button"
            onClick={onClose}
            aria-label="Close analysis panel"
          >
            X
          </button>
        </header>

        <div className="analysis-drawer__meta-row">
          <span className="analysis-drawer__meta-pill">
            {lastFetchedAt
              ? `Last synced ${formatLastUpdated(lastFetchedAt)}`
              : "Waiting for first sync"}
          </span>
          <button type="button" className="analysis-drawer__refresh-button" onClick={onRefresh}>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {hasAnalysis && error ? (
          <div className="analysis-drawer__warning-banner">
            Showing the last available analysis while the feed reconnects.
          </div>
        ) : null}

        <div className="analysis-drawer__body">
          {shouldShowLoading ? <LoadingState /> : null}

          {shouldShowError ? (
            <EmptyState
              title="Analysis feed unavailable"
              description={error.message || "The latest analysis could not be loaded right now."}
              actionLabel="Try again"
              onAction={onRefresh}
            />
          ) : null}

          {shouldShowEmpty ? (
            <EmptyState
              title="No analysis yet"
              description="The monitoring backend has not published an analysis snapshot yet. This panel will populate automatically when the first report arrives."
              actionLabel="Check again"
              onAction={onRefresh}
            />
          ) : null}

          {hasAnalysis ? (
            <div className="analysis-drawer__content">
              <section className="analysis-drawer__hero-panel">
                <div className="analysis-drawer__badge-row">
                  <AnalysisBadge
                    label={`Situation: ${formatAnalysisLabel(analysis?.situation, "Unknown")}`}
                    tone={situationTone}
                  />
                  <AnalysisBadge
                    label={`Threat: ${formatAnalysisLabel(analysis?.threatLevel, "Unknown")}`}
                    tone={threatTone}
                  />
                </div>

                <div className="analysis-drawer__hero-grid">
                  <div className="analysis-drawer__hero-item">
                    <span>Analysis time</span>
                    <strong>{formatAnalysisTimestamp(analysis?.time)}</strong>
                  </div>
                  <div className="analysis-drawer__hero-item">
                    <span>Recommendation status</span>
                    <strong>{formatAnalysisLabel(analysis?.threatLevel, "Pending")}</strong>
                  </div>
                </div>
              </section>

              <section className="analysis-drawer__section">
                <div className="analysis-drawer__section-header">
                  <h3>Alerts</h3>
                  <span>{analysis?.alerts?.length ?? 0}</span>
                </div>

                {analysis?.alerts?.length ? (
                  <div className="analysis-drawer__alert-list">
                    {analysis.alerts.map((alert, index) => (
                      <div
                        key={`${alert}-${index}`}
                        className={`analysis-drawer__alert-pill analysis-tone--${threatTone}`}
                      >
                        {alert}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="analysis-drawer__section-copy analysis-drawer__section-copy--muted">
                    No active alerts were reported in the latest analysis.
                  </p>
                )}
              </section>

              <section className="analysis-drawer__section">
                <div className="analysis-drawer__section-header">
                  <h3>Detailed analysis</h3>
                </div>
                <p className="analysis-drawer__section-copy">
                  {analysis?.analysis ||
                    "No detailed explanation was included in the latest analysis."}
                </p>
              </section>

              <section className="analysis-drawer__action-panel">
                <span className="analysis-drawer__action-kicker">Recommended action</span>
                <p>
                  {analysis?.recommendedAction ||
                    "No recommended action was included in the latest analysis."}
                </p>
              </section>

              {hasAdvancedDetails ? (
                <details className="analysis-drawer__details">
                  <summary>Advanced details</summary>

                  {analysis?.summary ? (
                    <div className="analysis-drawer__details-block">
                      <span>Summary</span>
                      <p>{analysis.summary}</p>
                    </div>
                  ) : null}

                  {flagEntries.length > 0 ? (
                    <div className="analysis-drawer__details-block">
                      <span>Flags</span>
                      <div className="analysis-drawer__flag-list">
                        {flagEntries.map((flag) => (
                          <div key={flag} className="analysis-drawer__flag-item">
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </details>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
