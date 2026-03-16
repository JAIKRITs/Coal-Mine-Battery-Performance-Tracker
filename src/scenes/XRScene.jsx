import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, VRButton } from "@react-three/xr";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import MapOverlay from "../components/MapOverlay.jsx";

import ControlRoom from "./ControlRoom";
import SceneControls from "../components/SceneControls";


/* ---------------- CAMERA RIG (SIMPLE & STABLE) ---------------- */
function CameraRig({ activePanelRef }) {
  const { camera } = useThree();

  useFrame(() => {
    // ✅ If no active panel → DO NOTHING
    if (!activePanelRef.current) return;

    const p = activePanelRef.current.position;

    // Desired camera position near panel
    const targetX = p.x;
    const targetY = p.y + 0.6;
    const targetZ = 2.8;

    // Smooth move
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
  });

  return null;
}

/* ---------------- SCENE ---------------- */
export default function XRScene() {
  const activePanelRef = useRef(null);
  const [environmentFile, setEnvironmentFile] = useState("rogland_clear_night_4k.exr");

  return (
    <>
      <VRButton />

      <Canvas
        shadows
        camera={{ position: [0, 1.2, 4], fov: 55 }}
        style={{ width: "100vw", height: "100vh" }}
      >

        <OrbitControls
          enableRotate
          enablePan
          enableZoom
          panSpeed={0.8}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          dampingFactor={0.08}
          enableDamping
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.PAN,
          }}
        />

        {/* Background */}
        {/* <color attach="background" args={["#535568"]} /> */}
        {/* previouosly #ofofof */}

        {/* Background from .exr in /public */}
        {/* <Environment
          files="rogland_clear_night_4k.exr"
          background
        /> */}

        <Environment
          files={environmentFile}
          background
        />

        {/* Lighting */}
        <directionalLight
          position={[5, 6, 5]}
          intensity={1}
          castShadow
          shadowBias={-0.0005}
        />
        <ambientLight intensity={0.5} />

        {/* Floor (reference only) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#999999" /> 
          {/* previously #1a1a1a */}
        </mesh>

        {/* Debug helper */}
        <axesHelper args={[3]} />

        {/* XR + Dashboard */}
        <XR>
          <CameraRig activePanelRef={activePanelRef} />
          <ControlRoom activePanelRef={activePanelRef} />
        </XR>

      </Canvas>

      <SceneControls setEnvironmentFile={setEnvironmentFile} />

      <MapOverlay />
    </>
  );
}
