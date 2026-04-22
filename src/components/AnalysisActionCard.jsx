import {
  formatAnalysisLabel,
  formatAnalysisTimestamp,
  formatLastUpdated,
  getThreatTone,
} from "../utils/analysisPresentation.js";

function AnalysisIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="analysis-action-card__icon-svg">
      <path
        d="M5.5 6.5h7m-7 5h13m-13 5h9m4-10.5 1.9 3.3a1 1 0 0 1-.87 1.5h-3.8a1 1 0 0 1-.87-1.5L17 6a1 1 0 0 1 1.74 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.65"
      />
    </svg>
  );
}

export default function AnalysisActionCard({
  analysis,
  hasAnalysis,
  isLoading,
  isRefreshing,
  error,
  lastFetchedAt,
  onOpen,
}) {
  const threatTone = hasAnalysis ? getThreatTone(analysis?.threatLevel) : "neutral";
  const statusLabel = hasAnalysis
    ? "Latest analysis available"
    : isLoading
      ? "Checking analysis feed"
      : error
        ? "Analysis temporarily unavailable"
        : "No analysis published yet";
  const timestampLabel = hasAnalysis
    ? `Latest report ${formatAnalysisTimestamp(analysis?.time)}`
    : error
      ? "Open to review the current status"
      : "The drawer will open as soon as a report is available";
  const threatLabel = hasAnalysis
    ? formatAnalysisLabel(analysis?.threatLevel, "Status")
    : "Pending";
  const syncLabel = isRefreshing
    ? "Syncing..."
    : hasAnalysis
      ? `Updated ${formatLastUpdated(analysis?.ts || lastFetchedAt || null)}`
      : lastFetchedAt
        ? `Checked ${formatLastUpdated(lastFetchedAt)}`
        : "Waiting for report";

  return (
    <button
      type="button"
      className={[
        "analysis-action-card",
        `analysis-tone--${threatTone}`,
        threatTone === "high" ? "analysis-action-card--pulse" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onOpen}
      aria-label="Open environment analysis"
    >
      <span className="analysis-action-card__glow" aria-hidden="true" />
      <span className="analysis-action-card__icon">
        <AnalysisIcon />
      </span>

      <span className="analysis-action-card__content">
        <span className="analysis-action-card__eyebrow">LLM Insight</span>

        <span className="analysis-action-card__header">
          <span className="analysis-action-card__title">Analysis</span>
          <span className="analysis-action-card__badge">{threatLabel}</span>
        </span>

        <span className="analysis-action-card__status">{statusLabel}</span>
        <span className="analysis-action-card__timestamp">{timestampLabel}</span>

        <span className="analysis-action-card__footer">
          <span className="analysis-action-card__availability">
            {hasAnalysis ? "Available now" : "Open panel"}
          </span>
          <span className="analysis-action-card__sync">{syncLabel}</span>
        </span>
      </span>
    </button>
  );
}
