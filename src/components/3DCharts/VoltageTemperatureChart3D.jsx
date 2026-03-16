/**
 * 3D Voltage-Temperature Chart
 * Composed chart with bars for voltage and line for temperature
 */

import { Html } from '@react-three/drei';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const VoltageTemperatureChart3D = ({ data }) => {

  const chartData = (Array.isArray(data) ? data : [])
    .slice(-10)
    .map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      voltage: Number(d.voltage) || 0,
      temperature: Number(d.temperature) || 0,
    }));

  const voltageValues = chartData.map(d => d.voltage).filter(v => !isNaN(v));
  const temperatureValues = chartData.map(d => d.temperature).filter(v => !isNaN(v));

  if (voltageValues.length === 0 || temperatureValues.length === 0) {
    return null;
  }

  const voltageMin = Math.max(Math.min(...voltageValues) - 0.5, 0);
  const voltageMax = Math.min(Math.max(...voltageValues) + 0.5, 15);
  const temperatureMin = Math.max(Math.min(...temperatureValues) - 0.5, 0);
  const temperatureMax = Math.min(Math.max(...temperatureValues) + 0.5, 50);

  const voltageRange = voltageMax - voltageMin || 0.1;
  const temperatureRange = temperatureMax - temperatureMin || 1;

  const normalizedData = chartData.map(d => ({
    ...d,
    voltageNormalized: ((d.voltage - voltageMin) / voltageRange) * 100,
    temperatureNormalized: ((d.temperature - temperatureMin) / temperatureRange) * 100,
  }));

  return (
    <group>
      <Html
        transform
        position={[0, 0.05, -0.04]}
        scale={1}
        distanceFactor={1.5}
        pointerEvents="none"
        zIndexRange={[50, 0]}
      >
        <div
          style={{
            width: '360px',
            height: '190px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '2px solid rgba(65, 105, 225, 0.3)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94a3b8' }}>
            Voltage-Temperature
          </h2>

          <div style={{ flex: 1, minHeight: 0 }}>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={normalizedData} margin={{ top: 5, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                  />
                  <YAxis
                    yAxisId="voltage"
                    stroke="#ef4444"
                    domain={[0, 100]}
                    tick={{ fill: '#ef4444', fontSize: 9 }}
                    tickFormatter={v =>
                      (voltageMin + (v / 100) * voltageRange).toFixed(2)
                    }
                  />
                  <YAxis
                    yAxisId="temperature"
                    orientation="right"
                    stroke="#f59e0b"
                    domain={[0, 100]}
                    tick={{ fill: '#f59e0b', fontSize: 9 }}
                    tickFormatter={v =>
                      (temperatureMin + (v / 100) * temperatureRange).toFixed(1)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #404040',
                      borderRadius: '4px',
                      fontSize: '10px',
                    }}
                    formatter={(value, name, props) =>
                      name === 'Voltage'
                        ? [`${props.payload.voltage.toFixed(2)} V`, 'Voltage']
                        : [`${props.payload.temperature.toFixed(1)} °C`, 'Temperature']
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="voltage"
                    dataKey="voltageNormalized"
                    fill="#ef4444"
                    name="Voltage"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="temperature"
                    type="monotone"
                    dataKey="temperatureNormalized"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Temperature"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default VoltageTemperatureChart3D;
