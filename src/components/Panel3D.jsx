import { Text } from "@react-three/drei";
import { useState } from "react";
import { getPanelShellLayout } from "../utils/panelPresentation";

export default function Panel3D({
  title,
  children,
  isActive,
  presentation = "dashboard",
  contentVisible = true,
  onHoverChange,
}) {
  const [hovered, setHovered] = useState(false);
  const layout = getPanelShellLayout(presentation);
  const showHover = layout.hoverTilt > 0 && hovered;
  const emissiveColor = isActive
    ? layout.activeGlow
    : showHover
    ? layout.hoverGlow
    : "#000000";
  const emissiveIntensity = isActive
    ? layout.activeEmissiveIntensity
    : showHover
    ? layout.hoverEmissiveIntensity
    : 0;
  const handleHoverStart = (event) => {
    event.stopPropagation();
    if (layout.hoverTilt > 0) {
      setHovered(true);
    }
    onHoverChange?.(true);
  };

  const handleHoverEnd = (event) => {
    event.stopPropagation();
    setHovered(false);
    onHoverChange?.(false);
  };

  return (
    <group
      rotation={[
        showHover ? -layout.hoverTilt : 0,
        showHover ? layout.hoverTilt : 0,
        0,
      ]}
      onPointerOver={handleHoverStart}
      onPointerOut={handleHoverEnd}
    >
      <mesh position={[0, 0, -layout.depth * 0.42]}>
        <boxGeometry args={[layout.width * 0.94, layout.height * 0.9, 0.01]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={layout.shadowOpacity}
          depthWrite={false}
        />
      </mesh>

      <mesh
        castShadow
        receiveShadow
      >
        <boxGeometry args={[layout.width, layout.height, layout.depth]} />
        <meshStandardMaterial
          color={layout.baseColor}
          roughness={0.36}
          metalness={0.1}
          transparent
          opacity={layout.bodyOpacity}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      <mesh position={[0, 0, layout.depth * 0.52]}>
        <planeGeometry args={[layout.width * 0.972, layout.height * 0.958]} />
        <meshBasicMaterial
          color={layout.edgeColor}
          transparent
          opacity={layout.glassOpacity}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, layout.depth * 0.57]}>
        <planeGeometry args={[layout.width * 0.988, layout.height * 0.976]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={layout.outlineOpacity}
          depthWrite={false}
        />
      </mesh>

      {title ? (
        <Text
          position={layout.titlePosition}
          fontSize={layout.titleFontSize}
          color="#edf2f7"
          anchorX={layout.titleAnchorX}
          anchorY="middle"
          depthTest={false}
          material-transparent
          material-opacity={layout.titleOpacity}
          maxWidth={layout.width - 0.36}
        >
          {title}
        </Text>
      ) : null}

      {contentVisible ? <group position={layout.contentPosition}>{children}</group> : null}
    </group>
  );
}
