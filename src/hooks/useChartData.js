import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLatestSensorReading,
  fetchSensorHistory,
  subscribeToSensorStream,
} from "../api/sensorApi";

const HISTORY_SNAPSHOT_STORAGE_KEY = "sensorHistorySnapshot";

function reindexData(readings) {
  return readings.map((reading, index) => ({
    ...reading,
    index,
  }));
}

function readHistorySnapshot() {
  try {
    const storedValue = window.localStorage.getItem(HISTORY_SNAPSHOT_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? reindexData(parsedValue) : [];
  } catch (error) {
    console.error("Unable to read the cached sensor history snapshot.", error);
    return [];
  }
}

function writeHistorySnapshot(readings) {
  try {
    window.localStorage.setItem(
      HISTORY_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(readings)
    );
  } catch (error) {
    console.error("Unable to cache the sensor history snapshot.", error);
  }
}

function clearHistorySnapshot() {
  try {
    window.localStorage.removeItem(HISTORY_SNAPSHOT_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear the cached sensor history snapshot.", error);
  }
}

function upsertReading(currentReadings, nextReading) {
  if (!nextReading) {
    return currentReadings;
  }

  const existingIndex = currentReadings.findIndex(
    (reading) =>
      reading.ts === nextReading.ts || reading.timestamp === nextReading.timestamp
  );

  if (existingIndex >= 0) {
    const updatedReadings = [...currentReadings];
    updatedReadings[existingIndex] = {
      ...updatedReadings[existingIndex],
      ...nextReading,
    };

    return reindexData(
      updatedReadings.sort((firstEntry, secondEntry) => firstEntry.ts - secondEntry.ts)
    );
  }

  return reindexData(
    [...currentReadings, nextReading].sort(
      (firstEntry, secondEntry) => firstEntry.ts - secondEntry.ts
    )
  );
}

export function useChartData(updateInterval = 3000) {
  const [data, setData] = useState(() => readHistorySnapshot());
  const dataRef = useRef([]);
  const socketConnectedRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    async function syncLatestReading() {
      try {
        const latestReading = await fetchLatestSensorReading();

        if (!isMounted || !latestReading) {
          return;
        }

        setData((currentReadings) => upsertReading(currentReadings, latestReading));
      } catch (error) {
        console.error("Unable to fetch the latest sensor reading.", error);
      }
    }

    async function initializeHistory() {
      try {
        const history = await fetchSensorHistory();

        if (!isMounted) {
          return;
        }

        if (history.length > 0) {
          setData(reindexData(history));
          writeHistorySnapshot(history);
          return;
        }

        setData([]);
        clearHistorySnapshot();
        await syncLatestReading();
      } catch (error) {
        console.error("Unable to load sensor history.", error);
        await syncLatestReading();
      }
    }

    initializeHistory();

    const unsubscribe = subscribeToSensorStream(
      (reading) => {
        if (!isMounted) {
          return;
        }

        setData((currentReadings) => upsertReading(currentReadings, reading));
      },
      ({ status, error }) => {
        socketConnectedRef.current = status === "connected";

        if (status === "error") {
          console.error("Sensor stream connection error.", error);
        }
      }
    );

    const fallbackInterval = window.setInterval(() => {
      if (socketConnectedRef.current && dataRef.current.length > 0) {
        return;
      }

      syncLatestReading();
    }, updateInterval);

    return () => {
      isMounted = false;
      socketConnectedRef.current = false;
      window.clearInterval(fallbackInterval);
      unsubscribe?.();
    };
  }, [updateInterval]);

  const getRecentData = useCallback(
    (n = 20) => {
      return data.slice(-n);
    },
    [data]
  );
  const resetChartData = useCallback(() => {
    setData([]);
  }, []);
  const latestPoint = data[data.length - 1] ?? null;

  return {
    data,
    latestPoint,
    getRecentData,
    resetChartData,
    humidity: latestPoint?.humidity || 0,
    temperature: latestPoint?.temperature || 0,
    voltage: latestPoint?.voltage || 0,
  };
}
