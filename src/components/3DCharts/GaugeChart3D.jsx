/**
 * 3D Gauge Chart - SVG-based gauge indicators for Humidity, Temperature, and Voltage
 * Displays three circular progress gauges with real-time mock data
 */

import { Html } from '@react-three/drei';

const Gauge = ({ value, label, max, color }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
        <svg style={{ transform: 'rotate(-90deg)', width: '96px', height: '96px' }}>
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="35"
            stroke="#404040"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="35"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        {/* Center value */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ffffff',
              textShadow: `0 0 10px ${color}`,
            }}
          >
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      {/* Label */}
      <span
        style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#94a3b8',
          textTransform: 'capitalize',
        }}
      >
        {label}
      </span>
    </div>
  );
};

const GaugeChart3D = ({ humidity = 0, temperature = 0, voltage = 0 }) => {
  return (
    <group>
      <Html
        transform
        position={[0, 0.1, -0.04]}
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
            cursor: 'pointer',
          }}
        >
          {/* Title */}
          <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>
            Voltage Monitoring and Temperature
          </h2>

          {/* Gauges Container */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Gauge
              value={humidity}
              label="Humidity"
              max={100}
              color="#22c55e"
            />
            <Gauge
              value={temperature}
              label="Temperature"
              max={50}
              color="#f59e0b"
            />
            <Gauge
              value={voltage}
              label="Voltage"
              max={15}
              color="#ef4444"
            />
          </div>
        </div>
      </Html>
    </group>
  );
};

export default GaugeChart3D;
