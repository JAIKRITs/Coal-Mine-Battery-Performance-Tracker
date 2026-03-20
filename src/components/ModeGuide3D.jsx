import { Text } from "@react-three/drei";
import { useState } from "react";

export default function ModeGuide3D({
  isActive,
  disabled = false,
  onToggle,
  title,
  activeTitle,
  subtitle,
  activeSubtitle,
  disabledSubtitle = "Desktop only",
  position = [0, -1.1, 3.5],
  eyeAnchorRef,
  lookTargetRef,
}) {
  const [hovered, setHovered] = useState(false);
  const isInteractive = !disabled && typeof onToggle === "function";

  const accentColor = isActive ? "#22ff88" : hovered ? "#4fd1c5" : "#9ca3af";
  const bodyColor = disabled ? "#374151" : "#1f2937";

  const handleHover = (event, nextHovered) => {
    event.stopPropagation();

    if (isInteractive) {
      setHovered(nextHovered);
    }
  };

  const handleToggle = (event) => {
    event.stopPropagation();

    if (isInteractive) {
      onToggle();
    }
  };

  return (
    <group position={position}>
      <mesh position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive={accentColor}
          emissiveIntensity={isActive ? 0.18 : hovered ? 0.1 : 0.04}
          opacity={0.95}
          transparent
        />
      </mesh>

      <group>
        <mesh position={[0, 0.28, 0]}>
          <capsuleGeometry args={[0.2, 0.58, 8, 16]} />
          <meshStandardMaterial
            color={bodyColor}
            metalness={0.2}
            roughness={0.6}
            emissive={accentColor}
            emissiveIntensity={isActive ? 0.26 : hovered ? 0.16 : 0.05}
          />
        </mesh>

        <mesh position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial
            color="#d1d5db"
            metalness={0.15}
            roughness={0.5}
            emissive={accentColor}
            emissiveIntensity={isActive ? 0.18 : hovered ? 0.08 : 0.02}
          />
        </mesh>

        <mesh position={[-0.27, 0.45, 0]} rotation={[0, 0, 0.52]}>
          <capsuleGeometry args={[0.06, 0.42, 6, 10]} />
          <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0.27, 0.45, 0]} rotation={[0, 0, -0.52]}>
          <capsuleGeometry args={[0.06, 0.42, 6, 10]} />
          <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.6} />
        </mesh>

        <mesh position={[-0.11, -0.42, 0]} rotation={[0, 0, 0.05]}>
          <capsuleGeometry args={[0.07, 0.5, 6, 10]} />
          <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0.11, -0.42, 0]} rotation={[0, 0, -0.05]}>
          <capsuleGeometry args={[0.07, 0.5, 6, 10]} />
          <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.6} />
        </mesh>

        {eyeAnchorRef ? <object3D ref={eyeAnchorRef} position={[0, 1.15, -0.05]} /> : null}
        {lookTargetRef ? <object3D ref={lookTargetRef} position={[0, 1.1, -2.65]} /> : null}

        <mesh
          position={[0, 0.3, 0]}
          onPointerOver={(event) => handleHover(event, true)}
          onPointerOut={(event) => handleHover(event, false)}
          onClick={handleToggle}
        >
          <sphereGeometry args={[0.58, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <Text
        position={[0, 1.55, 0]}
        fontSize={0.09}
        color={disabled ? "#6b7280" : accentColor}
        anchorX="center"
        anchorY="middle"
        depthTest={false}
      >
        {isActive ? activeTitle : title}
      </Text>

      <Text
        position={[0, 1.38, 0]}
        fontSize={0.05}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        depthTest={false}
      >
        {disabled ? disabledSubtitle : isActive ? activeSubtitle : subtitle}
      </Text>
    </group>
  );
}
