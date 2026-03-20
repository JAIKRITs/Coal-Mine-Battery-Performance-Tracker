import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import Panel3D from "../components/Panel3D";
import MapPreview from "../components/MapPreview";
import ExperienceGuide3D from "../components/ExperienceGuide3D";
import PanelMoveGuide3D from "../components/PanelMoveGuide3D";
import MovablePanelGroup from "../components/MovablePanelGroup";

import HumidityChart3D from "../components/3DCharts/HumidityChart3D";
import HumidityTemperatureChart3D from "../components/3DCharts/HumidityTemperatureChart3D";
import TemperatureHumidityRelation3D from "../components/3DCharts/TemperatureHumidityRelation3D";
import VoltageTemperatureChart3D from "../components/3DCharts/VoltageTemperatureChart3D";
import GaugeChart3D from "../components/3DCharts/GaugeChart3D";

import { useChartData } from "../hooks/useChartData";
import { CONTROL_ROOM_PANEL_LAYOUT } from "../utils/panelLayout";

export default function ControlRoom({
  activePanelRef,
  onActivePanelChange,
  experiencePOV = false,
  moveModeActive = false,
  moveSessionId = 0,
  isPresenting = false,
  onToggleExperience,
  onToggleMoveMode,
  onPanelDragStateChange,
  experienceEyeRef,
  experienceLookTargetRef,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const chartData = useChartData(3000);

  const panelRefs = {
    tempHum: useRef(null),
    tempHumidityChart: useRef(null),
    humidity: useRef(null),
    map: useRef(null),
    voltage: useRef(null),
    bottom: useRef(null),
  };

  const interactionsLocked = experiencePOV || moveModeActive;
  const visibleActivePanel = interactionsLocked ? null : activePanel;
  const moveGuideDisabled = isPresenting || experiencePOV;
  const moveGuideDisabledSubtitle = isPresenting ? "Desktop only" : "Exit POV first";

  const panelContent = useMemo(
    () => ({
      tempHum: <TemperatureHumidityRelation3D data={chartData.data} />,
      tempHumidityChart: <HumidityTemperatureChart3D data={chartData.data} />,
      humidity: <HumidityChart3D humidity={chartData.humidity} data={chartData.data} />,
      map: visibleActivePanel !== "map" && (
        <Html
          transform
          position={[0, 0, 0.05]}
          style={{
            width: "360px",
            height: "180px",
          }}
          distanceFactor={1.5}
          pointerEvents={experiencePOV || moveModeActive ? "none" : "auto"}
          zIndexRange={[50, 0]}
        >
          <MapPreview />
        </Html>
      ),
      voltage: <VoltageTemperatureChart3D data={chartData.data} />,
      bottom: (
        <GaugeChart3D
          humidity={chartData.humidity}
          temperature={chartData.temperature}
          voltage={chartData.voltage}
        />
      ),
    }),
    [
      chartData.data,
      chartData.humidity,
      chartData.temperature,
      chartData.voltage,
      experiencePOV,
      moveModeActive,
      visibleActivePanel,
    ]
  );

  const togglePanel = (key) => {
    if (interactionsLocked) {
      return;
    }

    setActivePanel((currentPanel) => (currentPanel === key ? null : key));
  };

  useEffect(() => {
    if (visibleActivePanel === "map" && !experiencePOV && !moveModeActive) {
      window.dispatchEvent(new Event("open-map"));
    }
  }, [visibleActivePanel, experiencePOV, moveModeActive]);

  useEffect(() => {
    const closeMap = () => {
      setActivePanel(null);
    };

    window.addEventListener("close-map", closeMap);

    return () => {
      window.removeEventListener("close-map", closeMap);
    };
  }, []);

  useEffect(() => {
    onActivePanelChange?.(visibleActivePanel);
  }, [visibleActivePanel, onActivePanelChange]);

  useEffect(() => {
    if (!experiencePOV && !moveModeActive) {
      return;
    }

    onPanelDragStateChange?.(false);
    window.dispatchEvent(new Event("close-map"));

    const timeoutId = window.setTimeout(() => {
      setActivePanel(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [experiencePOV, moveModeActive, onPanelDragStateChange]);

  useFrame(() => {
    if (experiencePOV || moveModeActive) {
      if (activePanelRef) {
        activePanelRef.current = null;
      }
      return;
    }

    let foundActive = false;

    Object.entries(panelRefs).forEach(([key, ref]) => {
      if (!ref.current) {
        return;
      }

      if (visibleActivePanel === key && activePanelRef) {
        activePanelRef.current = ref.current;
        foundActive = true;
      }
    });

    if (!foundActive && activePanelRef) {
      activePanelRef.current = null;
    }
  });

  return (
    <group onClick={() => !interactionsLocked && setActivePanel(null)}>
      <ExperienceGuide3D
        isActive={experiencePOV}
        disabled={isPresenting || moveModeActive}
        onToggle={onToggleExperience}
        eyeAnchorRef={experienceEyeRef}
        lookTargetRef={experienceLookTargetRef}
      />

      <PanelMoveGuide3D
        isActive={moveModeActive}
        disabled={moveGuideDisabled}
        disabledSubtitle={moveGuideDisabledSubtitle}
        onToggle={onToggleMoveMode}
      />

      {CONTROL_ROOM_PANEL_LAYOUT.map((panel) => (
        <MovablePanelGroup
          key={`${panel.key}-${moveSessionId}`}
          ref={panelRefs[panel.key]}
          panelKey={panel.key}
          defaultPosition={panel.defaultPosition}
          moveModeActive={moveModeActive}
          movable={panel.movable}
          onTogglePanel={togglePanel}
          onDragStateChange={onPanelDragStateChange}
        >
          <Panel3D title={panel.title} isActive={visibleActivePanel === panel.key}>
            {panelContent[panel.key]}
          </Panel3D>
        </MovablePanelGroup>
      ))}
    </group>
  );
}
