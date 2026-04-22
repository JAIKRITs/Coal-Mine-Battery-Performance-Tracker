export const ANALYSIS_REFRESH_INTERVAL_MS = 300000;

const LOW_KEYWORDS = ["normal", "low", "safe", "stable", "clear", "nominal", "good"];
const MEDIUM_KEYWORDS = ["watch", "medium", "elevated", "moderate", "caution", "warning"];
const HIGH_KEYWORDS = ["high", "alert", "critical", "danger", "unsafe", "severe", "threat"];

function normalizeText(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function humanizeText(value, fallback) {
  const text = normalizeText(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return fallback;
  }

  return text.replace(/\b\w/g, (character) => character.toUpperCase());
}

function hasMatchingKeyword(value, keywords) {
  const text = normalizeText(value).toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

function formatRelativeMinutes(minutes) {
  if (minutes <= 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatFlagValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeText(entry))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        const resolvedValue = formatFlagValue(nestedValue);
        return resolvedValue ? `${humanizeText(key, "Flag")}: ${resolvedValue}` : "";
      })
      .filter(Boolean)
      .join(" • ");
  }

  return normalizeText(value);
}

export function getThreatTone(value) {
  if (hasMatchingKeyword(value, HIGH_KEYWORDS)) {
    return "high";
  }

  if (hasMatchingKeyword(value, MEDIUM_KEYWORDS)) {
    return "medium";
  }

  if (hasMatchingKeyword(value, LOW_KEYWORDS)) {
    return "low";
  }

  return "neutral";
}

export function getSituationTone(value) {
  if (hasMatchingKeyword(value, HIGH_KEYWORDS)) {
    return "high";
  }

  if (hasMatchingKeyword(value, MEDIUM_KEYWORDS)) {
    return "medium";
  }

  if (hasMatchingKeyword(value, LOW_KEYWORDS)) {
    return "low";
  }

  return "neutral";
}

export function formatAnalysisLabel(value, fallback = "Unknown") {
  return humanizeText(value, fallback);
}

export function formatAnalysisTimestamp(value) {
  const parsedTimestamp = new Date(value);

  if (!value || Number.isNaN(parsedTimestamp.getTime())) {
    return "Timestamp unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedTimestamp);
}

export function formatLastUpdated(lastFetchedAt) {
  if (!Number.isFinite(lastFetchedAt)) {
    return "Not synced yet";
  }

  const diffMs = Math.max(0, Date.now() - lastFetchedAt);
  const minutes = Math.round(diffMs / 60000);
  return formatRelativeMinutes(minutes);
}

export function isAnalysisStale(
  lastFetchedAt,
  refreshInterval = ANALYSIS_REFRESH_INTERVAL_MS
) {
  if (!Number.isFinite(lastFetchedAt)) {
    return true;
  }

  return Date.now() - lastFetchedAt >= refreshInterval;
}

export function getFlagEntries(flags) {
  if (Array.isArray(flags)) {
    return flags
      .flatMap((entry) => {
        if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
          const value = normalizeText(entry);
          return value ? [value] : [];
        }

        if (entry && typeof entry === "object") {
          return Object.entries(entry)
            .map(([key, value]) => {
              const formattedValue = formatFlagValue(value);
              return formattedValue
                ? `${humanizeText(key, "Flag")}: ${formattedValue}`
                : "";
            })
            .filter(Boolean);
        }

        return [];
      })
      .filter(Boolean);
  }

  if (flags && typeof flags === "object") {
    return Object.entries(flags)
      .map(([key, value]) => {
        const formattedValue = formatFlagValue(value);
        return formattedValue ? `${humanizeText(key, "Flag")}: ${formattedValue}` : "";
      })
      .filter(Boolean);
  }

  const text = normalizeText(flags);
  return text ? [text] : [];
}
