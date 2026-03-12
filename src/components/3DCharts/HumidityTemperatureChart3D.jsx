// /**
//  * 3D Humidity-Temperature Time Series Chart
//  * Shows dual line chart with temperature and humidity over time
//  */

// import { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Html } from '@react-three/drei';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';
// import gsap from 'gsap';

// const HumidityTemperatureChart3D = ({ data }) => {
//   const groupRef = useRef();
//   const meshRef = useRef();

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
//     }
//     if (meshRef.current) {
//       meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
//     }
//   });

//   const chartData = (Array.isArray(data) ? data : [])
//     .slice(-20)
//     .map(d => ({
//       time: new Date(d.timestamp).toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//       }),
//       humidity: Number(d.humidity) || 0,
//       temperature: Number(d.temperature) || 0,
//     }));

//   const hMin = Math.min(...chartData.map(d => d.humidity), 60);
//   const hMax = Math.max(...chartData.map(d => d.humidity), 75);
//   const tMin = Math.min(...chartData.map(d => d.temperature), 25);
//   const tMax = Math.max(...chartData.map(d => d.temperature), 35);

//   const hPadding = Math.max((hMax - hMin) * 0.15, 1);
//   const tPadding = Math.max((tMax - tMin) * 0.15, 1);

//   return (
//     <group ref={groupRef}>
//       <mesh ref={meshRef}>
//         <planeGeometry args={[2.6, 1.5]} />
//         <meshStandardMaterial
//           color="#0f172a"
//           metalness={0.3}
//           roughness={0.7}
//         />
//       </mesh>

//       <Html transform position={[0, 0, 0.01]} scale={0.0035}>
//         <div
//           style={{
//             width: '750px',
//             height: '430px',
//             background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
//             border: '2px solid rgba(65, 105, 225, 0.3)',
//             borderRadius: '12px',
//             padding: '15px',
//             boxShadow: '0 0 40px rgba(34, 197, 94, 0.15)',
//             display: 'flex',
//             flexDirection: 'column',
//             color: 'white',
//             fontFamily: 'sans-serif',
//           }}
//         >
//           <h2 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94a3b8' }}>
//             temperature-humidity
//           </h2>

//           <div style={{ flex: 1, minHeight: 0 }}>
//             {chartData.length > 0 && (
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={chartData} margin={{ top: 5, right: 15, bottom: 20, left: 10 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
//                   <XAxis
//                     dataKey="time"
//                     stroke="#64748b"
//                     tick={{ fill: '#64748b', fontSize: 9 }}
//                   />
//                   <YAxis
//                     yAxisId="humidity"
//                     domain={[hMin - hPadding, hMax + hPadding]}
//                     stroke="#22c55e"
//                     tick={{ fill: '#22c55e', fontSize: 9 }}
//                   />
//                   <YAxis
//                     yAxisId="temperature"
//                     orientation="right"
//                     domain={[tMin - tPadding, tMax + tPadding]}
//                     stroke="#f59e0b"
//                     tick={{ fill: '#f59e0b', fontSize: 9 }}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: '#1e293b',
//                       border: '1px solid #404040',
//                       borderRadius: '4px',
//                       fontSize: '10px',
//                     }}
//                     formatter={(val, key) =>
//                       key === 'humidity'
//                         ? [`${val.toFixed(1)} %`, 'Humidity']
//                         : [`${val.toFixed(1)} °C`, 'Temperature']
//                     }
//                   />
//                   <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
//                   <Line
//                     yAxisId="humidity"
//                     type="monotone"
//                     dataKey="humidity"
//                     stroke="#22c55e"
//                     strokeWidth={2}
//                     dot={false}
//                     isAnimationActive={false}
//                     name="Humidity"
//                   />
//                   <Line
//                     yAxisId="temperature"
//                     type="monotone"
//                     dataKey="temperature"
//                     stroke="#f59e0b"
//                     strokeWidth={2}
//                     dot={false}
//                     isAnimationActive={false}
//                     name="Temperature"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>
//       </Html>
//     </group>
//   );
// };

// export default HumidityTemperatureChart3D;