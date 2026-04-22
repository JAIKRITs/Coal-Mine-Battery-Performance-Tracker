import { io } from "socket.io-client";

const DEFAULT_SENSOR_API_BASE_URL = "http://10.131.205.166:5000";
const SENSOR_API_BASE_URL = (
  import.meta.env.VITE_SENSOR_API_BASE_URL || DEFAULT_SENSOR_API_BASE_URL
).replace(/\/+$/, "");

function buildApiUrl(path) {
  return `${SENSOR_API_BASE_URL}${path}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function createDummyVoltage(ts) {
  const timeFactor = ts / 1000;
  const simulatedVoltage =
    12 + Math.sin(timeFactor / 25 + 2) + 0.25 * Math.sin(timeFactor / 9);

  return Number(clamp(simulatedVoltage, 0, 15).toFixed(2));
}

export function normalizeSensorReading(reading, index = 0) {
  if (!reading || typeof reading !== "object") {
    return null;
  }

  const rawTimestamp =
    typeof reading.time === "string" && reading.time
      ? reading.time
      : typeof reading.timestamp === "string" && reading.timestamp
        ? reading.timestamp
        : new Date().toISOString();

  const parsedTimestamp = new Date(rawTimestamp).getTime();
  const ts = Number.isFinite(parsedTimestamp) ? parsedTimestamp : Date.now();

  return {
    timestamp: rawTimestamp,
    ts,
    index,
    temperature: Number(clamp(toNumber(reading.temperature), 0, 50).toFixed(2)),
    humidity: Number(clamp(toNumber(reading.humidity), 0, 100).toFixed(2)),
    pressure: Number(toNumber(reading.pressure).toFixed(2)),
    gasResistance:
      reading.gas == null ? null : Number(toNumber(reading.gas).toFixed(2)),
    voltage: createDummyVoltage(ts),
  };
}

export async function fetchSensorHistory(limit) {
  const response = await fetch(buildApiUrl("/history"));

  if (!response.ok) {
    throw new Error(`Failed to load sensor history: ${response.status}`);
  }

  const payload = await response.json();

  const normalizedHistory = (Array.isArray(payload) ? payload : [])
    .map((reading, index) => normalizeSensorReading(reading, index))
    .filter(Boolean)
    .sort((firstEntry, secondEntry) => firstEntry.ts - secondEntry.ts);

  const trimmedHistory =
    typeof limit === "number" ? normalizedHistory.slice(-limit) : normalizedHistory;

  return trimmedHistory.map((reading, index) => ({
      ...reading,
      index,
    }));
}

export async function fetchLatestSensorReading() {
  const response = await fetch(buildApiUrl("/data"));

  if (!response.ok) {
    throw new Error(`Failed to load latest sensor reading: ${response.status}`);
  }

  const payload = await response.json();

  return normalizeSensorReading(payload);
}

export function subscribeToSensorStream(onReading, onStatusChange) {
  const socket = io(SENSOR_API_BASE_URL, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    onStatusChange?.({ status: "connected" });
  });

  socket.on("disconnect", (reason) => {
    onStatusChange?.({ status: "disconnected", reason });
  });

  socket.on("connect_error", (error) => {
    onStatusChange?.({ status: "error", error });
  });

  socket.on("sensor_data", (reading) => {
    const normalizedReading = normalizeSensorReading(reading);

    if (normalizedReading) {
      onReading?.(normalizedReading);
    }
  });

  return () => {
    socket.disconnect();
  };
}
