/**
 * Custom hook for managing chart data with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getMockData,
  addMockDataPoint,
  getLatestDataPoint,
  getRecentDataPoints,
} from '../utils/mockChartData';

export function useChartData(updateInterval = 3000) {
  const [data, setData] = useState(() => getMockData());
  const [latestPoint, setLatestPoint] = useState(() => getLatestDataPoint());

  // Update data every N milliseconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = addMockDataPoint();
      setData(getMockData());
      setLatestPoint(newPoint);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Utility functions
  const getRecentData = useCallback((n = 20) => {
    return getRecentDataPoints(n);
  }, []);

  return {
    data, // All historical data (up to 100 points)
    latestPoint, // Latest single data point
    getRecentData, // Function to get last N points
    humidity: latestPoint?.humidity || 0,
    temperature: latestPoint?.temperature || 0,
    voltage: latestPoint?.voltage || 0,
  };
}
