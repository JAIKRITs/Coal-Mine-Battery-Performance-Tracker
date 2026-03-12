// /**
//  * 3D Gauge Chart - Three circular gauges for Humidity, Temperature, and Voltage
//  */

// import { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { Html } from '@react-three/drei';
// import gsap from 'gsap';

// const Gauge = ({ value, label, max, color, position }) => {
//   const groupRef = useRef();
//   const valueRef = useRef({ current: 0 });

//   useEffect(() => {
//     gsap.to(valueRef.current, {
//       current: value,
//       duration: 1.5,
//       ease: 'power2.out',
//     });
//   }, [value]);

//   const percentage = (value / max) * 100;

//   return (
//     <group ref={groupRef} position={position}>
//       {/* Gauge background circle */}
//       <mesh>
//         <ringGeometry args={[0.6, 0.8, 64]} />
//         <meshStandardMaterial
//           color="#1e293b"
//           metalness={0.2}
//           roughness={0.8}
//         />
//       </mesh>

//       {/* Gauge progress circle */}
//       <mesh position={[0, 0, 0.01]}>
//         <ringGeometry
//           args={[0.6, 0.8, 64, 1, 0, (percentage / 100) * Math.PI * 2]}
//         />
//         <meshStandardMaterial
//           color={color}
//           metalness={0.4}
//           roughness={0.6}
//           emissive={color}
//           emissiveIntensity={0.3}
//         />
//       </mesh>

//       {/* Center circle */}
//       <mesh position={[0, 0, 0.02]}>
//         <circleGeometry args={[0.55, 32]} />
//         <meshStandardMaterial
//           color="#0f172a"
//           metalness={0.3}
//           roughness={0.7}
//         />
//       </mesh>

//       {/* HTML Label - Value inside gauge */}
//       <Html position={[0, 0, 0.1]} scale={0.01} center>
//         <div
//           style={{
//             textAlign: 'center',
//             fontSize: '32px',
//             fontWeight: 'bold',
//             color: color,
//             textShadow: `0 0 10px ${color}`,
//             whiteSpace: 'nowrap',
//           }}
//         >
//           {valueRef.current.current.toFixed(1)}
//         </div>
//       </Html>

//       {/* HTML Label - Label below gauge */}
//       <Html position={[0, -1, 0.1]} scale={0.01} center>
//         <div
//           style={{
//             textAlign: 'center',
//             fontSize: '14px',
//             color: '#94a3b8',
//             textTransform: 'capitalize',
//             whiteSpace: 'nowrap',
//           }}
//         >
//           {label}
//         </div>
//       </Html>
//     </group>
//   );
// };

// const GaugeChart3D = ({ humidity = 0, temperature = 0, voltage = 0 }) => {
//   const groupRef = useRef();

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
//       groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.08;
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       {/* Title Label */}
//       <Html position={[0, 1.5, 0]} scale={0.015} center>
//         <div
//           style={{
//             fontSize: '20px',
//             fontWeight: '600',
//             color: '#94a3b8',
//             textAlign: 'center',
//             whiteSpace: 'nowrap',
//           }}
//         >
//           Voltage Monitoring and Temperature
//         </div>
//       </Html>

//       {/* Three Gauges */}
//       <group position={[0, 0, 0]}>
//         <Gauge 
//           value={humidity} 
//           label="Humidity" 
//           max={100} 
//           color="#22c55e" 
//           position={[-0.8, -0.2, 0]} 
//         />
//         <Gauge 
//           value={temperature} 
//           label="Temperature" 
//           max={50} 
//           color="#f59e0b" 
//           position={[0, -0.2, 0]} 
//         />
//         <Gauge 
//           value={voltage} 
//           label="Voltage" 
//           max={15} 
//           color="#ef4444" 
//           position={[0.8, -0.2, 0]} 
//         />
//       </group>
//     </group>
//   );
// };

// export default GaugeChart3D;