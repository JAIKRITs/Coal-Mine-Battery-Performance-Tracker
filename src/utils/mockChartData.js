/**
 * Mock Data Generator for 3D Charts
 * Generates realistic sensor data with variations
 */

let dataHistory = [];

/**
 * Generate a single data point with realistic variations
 */
function generateDataPoint(index) {
  const baseTime = new Date(Date.now() - (100 - index) * 3000); // Spread over time
  
  // Humidity: oscillates 50-80% with some noise
  const humidity = 65 + 15 * Math.sin(index * 0.1) + (Math.random() - 0.5) * 5;
  
  // Temperature: oscillates 20-35°C with some noise
  const temperature = 27 + 8 * Math.sin(index * 0.08 + 1) + (Math.random() - 0.5) * 3;
  
  // Voltage: 11-13V range (battery-like)
  const voltage = 12 + 1 * Math.sin(index * 0.12 + 2) + (Math.random() - 0.5) * 0.5;

  return {
    timestamp: baseTime.toISOString(),
    ts: baseTime.getTime(),
    humidity: Math.max(0, Math.min(100, humidity)),
    temperature: Math.max(0, Math.min(50, temperature)),
    voltage: Math.max(0, Math.min(15, voltage)),
    index,
  };
}

/**
 * Initialize historical data (100 points for graph history)
 */
export function initializeMockData() {
  dataHistory = Array.from({ length: 100 }, (_, i) => generateDataPoint(i));
  return dataHistory;
}

/**
 * Get all historical data
 */
export function getMockData() {
  return dataHistory;
}

/**
 * Add a new data point and maintain history (keep last 100)
 */
export function addMockDataPoint() {
  const newIndex = dataHistory.length;
  const newPoint = generateDataPoint(newIndex);
  dataHistory.push(newPoint);
  
  // Keep only last 100 points
  if (dataHistory.length > 100) {
    dataHistory = dataHistory.slice(-100);
  }
  
  return newPoint;
}

/**
 * Get latest data point
 */
export function getLatestDataPoint() {
  return dataHistory[dataHistory.length - 1] || generateDataPoint(0);
}

/**
 * Get recent N points for chart display
 */
export function getRecentDataPoints(n = 20) {
  return dataHistory.slice(-n);
}

/**
 * Calculate statistics for scatter plot
 */
export function calculateStats(data, key) {
  if (!Array.isArray(data) || data.length === 0) {
    return { max: 0, min: 0, mean: 0, difference: 0 };
  }

  const values = data.map(d => Number(d[key]) || 0).filter(v => !isNaN(v));
  
  if (values.length === 0) {
    return { max: 0, min: 0, mean: 0, difference: 0 };
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const mean = (values.reduce((a, b) => a + b, 0) / values.length);
  const difference = max - min;

  return {
    max: max.toFixed(2),
    min: min.toFixed(2),
    mean: mean.toFixed(2),
    difference: difference.toFixed(2),
  };
}

// Initialize on import
initializeMockData();
