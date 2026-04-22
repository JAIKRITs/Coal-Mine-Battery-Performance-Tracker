import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestAnalysis } from "../api/sensorApi.js";
import { ANALYSIS_REFRESH_INTERVAL_MS } from "../utils/analysisPresentation.js";

export function useAnalysisData(refreshInterval = ANALYSIS_REFRESH_INTERVAL_MS) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const mountedRef = useRef(true);
  const analysisRef = useRef(null);
  const activeRequestRef = useRef(null);

  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  const refreshAnalysis = useCallback(async ({ background = false } = {}) => {
    if (activeRequestRef.current) {
      return activeRequestRef.current;
    }

    const hasExistingAnalysis = Boolean(analysisRef.current);

    if (!background && !hasExistingAnalysis) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    const request = (async () => {
      try {
        const nextAnalysis = await fetchLatestAnalysis();

        if (!mountedRef.current) {
          return nextAnalysis;
        }

        setAnalysis(nextAnalysis);
        setLastFetchedAt(Date.now());
        setError(null);
        return nextAnalysis;
      } catch (nextError) {
        if (!mountedRef.current) {
          return null;
        }

        const resolvedError =
          nextError instanceof Error
            ? nextError
            : new Error("Unable to load the latest environment analysis.");

        console.error("Unable to fetch the latest environment analysis.", resolvedError);
        setError(resolvedError);
        return null;
      } finally {
        activeRequestRef.current = null;

        if (mountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    activeRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refreshAnalysis();

    const intervalId = window.setInterval(() => {
      refreshAnalysis({ background: true });
    }, refreshInterval);

    return () => {
      mountedRef.current = false;
      activeRequestRef.current = null;
      window.clearInterval(intervalId);
    };
  }, [refreshAnalysis, refreshInterval]);

  return {
    analysis,
    isLoading,
    isRefreshing,
    error,
    hasAnalysis: Boolean(analysis),
    lastFetchedAt,
    refreshAnalysis,
  };
}
