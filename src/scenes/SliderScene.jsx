import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useState } from "react";
import MapOverlay from "../components/MapOverlay.jsx";
import PanelSliderReel from "../components/PanelSliderReel.jsx";
import SceneControls from "../components/SceneControls.jsx";
import { useControlPanels } from "../hooks/useControlPanels.jsx";

export default function SliderScene({ onBackToDashboard }) {
  const [environmentFile, setEnvironmentFile] = useState("rogland_clear_night_4k.exr");
  const [activePanelKey, setActivePanelKey] = useState("tempHum");
  const panels = useControlPanels({
    mode: "slider",
    activePanelKey,
    interactionsEnabled: true,
    onRequestMapOpen: () => window.dispatchEvent(new Event("open-map")),
  });

  useEffect(() => {
    window.dispatchEvent(new Event("close-map"));
  }, [activePanelKey]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0.08, 6.7], fov: 38 }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <Environment files={environmentFile} background />

        <directionalLight
          position={[4, 5, 6]}
          intensity={1.05}
          castShadow
          shadowBias={-0.0005}
        />
        <ambientLight intensity={0.48} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]} receiveShadow>
          <planeGeometry args={[70, 70]} />
          <meshStandardMaterial color="#1a120d" roughness={0.94} metalness={0.08} />
        </mesh>

        <PanelSliderReel
          panels={panels}
          onActivePanelChange={setActivePanelKey}
          onRequestMapOpen={() => window.dispatchEvent(new Event("open-map"))}
        />
      </Canvas>

      <SceneControls
        setEnvironmentFile={setEnvironmentFile}
        actions={[
          {
            label: "Back to Dashboard",
            onClick: onBackToDashboard,
          },
        ]}
      />

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 24,
          transform: "translateX(-50%)",
          zIndex: 10000,
          padding: "10px 18px",
          borderRadius: "999px",
          background: "rgba(8, 10, 14, 0.46)",
          color: "#eef2f7",
          fontFamily: "sans-serif",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
          textAlign: "center",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {panels.find((panel) => panel.key === activePanelKey)?.sliderLabel ?? "Panel Slider"}
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            letterSpacing: "0.06em",
            opacity: 0.7,
            textTransform: "none",
          }}
        >
          Drag, scroll, or use arrow keys
        </div>
      </div>

      <MapOverlay />
    </>
  );
}
