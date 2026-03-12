// /**
//  * 3D Temperature-Humidity Relation Chart
//  * Displays scatter plot with statistics table
//  */

// import { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Html } from '@react-three/drei';
// import {
//   ScatterChart,
//   Scatter,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
// } from 'recharts';
// import { calculateStats } from '../../utils/mockChartData';

// const TemperatureHumidityRelation3D = ({ data }) => {
//   const groupRef = useRef();
//   const meshRef = useRef();

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.12;
//     }
//     if (meshRef.current) {
//       meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.06;
//     }
//   });

//   const scatterData = (Array.isArray(data) ? data : [])
//     .map(d => ({
//       temperature: Number(d.temperature) || 0,
//       humidity: Number(d.humidity) || 0,
//     }))
//     .filter(d => d.temperature > 0 && d.humidity > 0);

//   const humidityStats = calculateStats(data, 'humidity');
//   const temperatureStats = calculateStats(data, 'temperature');

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
//             Relation between temperature and humidity
//           </h2>

//           <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>
//             {/* Chart */}
//             <div style={{ flex: 2, minHeight: 0 }}>
//               {scatterData.length > 0 && (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
//                     <XAxis
//                       type="number"
//                       dataKey="temperature"
//                       stroke="#64748b"
//                       tick={{ fill: '#64748b', fontSize: 9 }}
//                       label={{
//                         value: 'Temperature (°C)',
//                         position: 'bottom',
//                         offset: 0,
//                         fill: '#64748b',
//                         fontSize: 9,
//                       }}
//                     />
//                     <YAxis
//                       type="number"
//                       dataKey="humidity"
//                       stroke="#64748b"
//                       tick={{ fill: '#64748b', fontSize: 9 }}
//                       label={{
//                         value: 'Humidity (%)',
//                         angle: -90,
//                         position: 'left',
//                         fill: '#64748b',
//                         fontSize: 9,
//                       }}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: '#1e293b',
//                         border: '1px solid #404040',
//                         borderRadius: '4px',
//                         fontSize: '10px',
//                         color: '#22c55e',
//                       }}
//                       cursor={{ strokeDasharray: '3 3' }}
//                     />
//                     <Scatter name="Humidity" data={scatterData} fill="#22c55e">
//                       {scatterData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill="#22c55e" />
//                       ))}
//                     </Scatter>
//                   </ScatterChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Stats Table */}
//             <div style={{ width: '180px', flexShrink: 0 }}>
//               <table style={{ width: '100%', fontSize: '9px', color: '#cbd5e1' }}>
//                 <thead>
//                   <tr style={{ borderBottom: '1px solid #404040' }}>
//                     <th style={{ textAlign: 'left', padding: '4px', color: '#94a3b8' }}>Name</th>
//                     <th style={{ textAlign: 'right', padding: '4px', color: '#94a3b8' }}>Max</th>
//                     <th style={{ textAlign: 'right', padding: '4px', color: '#94a3b8' }}>Min</th>
//                     <th style={{ textAlign: 'right', padding: '4px', color: '#94a3b8' }}>Mean</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr style={{ borderBottom: '1px solid #2d3748', color: '#22c55e' }}>
//                     <td style={{ padding: '4px' }}>humidity</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{humidityStats.max}</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{humidityStats.min}</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{humidityStats.mean}</td>
//                   </tr>
//                   <tr style={{ color: '#f59e0b' }}>
//                     <td style={{ padding: '4px' }}>temperature</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{temperatureStats.max}</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{temperatureStats.min}</td>
//                     <td style={{ textAlign: 'right', padding: '4px' }}>{temperatureStats.mean}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </Html>
//     </group>
//   );
// };

// export default TemperatureHumidityRelation3D;