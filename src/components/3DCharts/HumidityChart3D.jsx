/**
 * 3D Humidity Chart - Large value display with animated mini line chart
 * Uses Recharts for chart rendering with Three.js 3D effects
 */

import { useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import gsap from 'gsap';

const HumidityChart3D = ({ humidity, data }) => {
  const valueRef = useRef({ current: 0 });

  // Animate value changes with GSAP
  useEffect(() => {
    gsap.to(valueRef.current, {
      current: humidity,
      duration: 1.5,
      ease: 'power2.out',
    });
  }, [humidity]);

  // Prepare chart data
  const chartData = (Array.isArray(data) ? data : [])
    .slice(-20)
    .map(d => ({
      index: d.index || 0,
      value: Number(d.humidity) || 0,
    }));

  const minVal = Math.min(...chartData.map(d => d.value), 50);
  const maxVal = Math.max(...chartData.map(d => d.value), 80);
  const padding = Math.max((maxVal - minVal) * 0.2, 1);

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
            width: '350px',
            height: '180px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '2px solid rgba(65, 105, 225, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#94a3b8' }}>
            Humidity Monitoring
          </h2>

          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#22c55e',
              margin: '10px 0',
              textShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
            }}
          >
            {valueRef.current.current.toFixed(1)}%
          </div>

          <div style={{ width: '100%', height: '120px', marginTop: '15px' }}>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.3)" />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={[minVal - padding, maxVal + padding]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #404040',
                      borderRadius: '4px',
                      color: '#22c55e',
                      fontSize: '11px',
                    }}
                    formatter={val => [`${Number(val).toFixed(1)} %`, 'Humidity']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default HumidityChart3D;
