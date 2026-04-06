import { Html } from "@react-three/drei";
import { useMemo } from "react";
import MapPreview from "../components/MapPreview.jsx";
import GaugeChart3D from "../components/3DCharts/GaugeChart3D.jsx";
import HumidityChart3D from "../components/3DCharts/HumidityChart3D.jsx";
import HumidityTemperatureChart3D from "../components/3DCharts/HumidityTemperatureChart3D.jsx";
import TemperatureHumidityRelation3D from "../components/3DCharts/TemperatureHumidityRelation3D.jsx";
import VoltageTemperatureChart3D from "../components/3DCharts/VoltageTemperatureChart3D.jsx";
import { CONTROL_PANEL_DEFINITIONS } from "../utils/controlPanelDefinitions";
import { getPanelContentLayout } from "../utils/panelPresentation";
import { useChartData } from "./useChartData";

export function useControlPanels({
  mode = "dashboard",
  activePanelKey = null,
  interactionsEnabled = true,
  onRequestMapOpen,
} = {}) {
  const chartData = useChartData(3000);
  const contentVariant = mode === "slider" ? "sliderFocus" : "dashboard";
  const contentLayout = getPanelContentLayout(contentVariant);

  return useMemo(() => {
    return CONTROL_PANEL_DEFINITIONS.map((panel) => {
      let content = null;

      switch (panel.key) {
        case "tempHum":
          content = (
            <TemperatureHumidityRelation3D
              data={chartData.data}
              variant={contentVariant}
            />
          );
          break;
        case "tempHumidityChart":
          content = (
            <HumidityTemperatureChart3D
              data={chartData.data}
              variant={contentVariant}
            />
          );
          break;
        case "humidity":
          content = (
            <HumidityChart3D
              humidity={chartData.humidity}
              data={chartData.data}
              variant={contentVariant}
            />
          );
          break;
        case "map":
          content =
            mode === "dashboard" ? (
              activePanelKey !== "map" ? (
                <Html
                  transform
                  position={[0, 0, 0.05]}
                  style={{
                    width: `${contentLayout.width}px`,
                    height: `${contentLayout.mapHeight}px`,
                  }}
                  distanceFactor={1.5}
                  pointerEvents={interactionsEnabled ? "auto" : "none"}
                  zIndexRange={[50, 0]}
                >
                  <MapPreview variant={contentVariant} />
                </Html>
              ) : null
            ) : (
              <Html
                transform
                position={[0, 0, 0.05]}
                style={{
                  width: `${contentLayout.width}px`,
                  height: `${contentLayout.mapHeight}px`,
                }}
                distanceFactor={1.5}
                pointerEvents={
                  interactionsEnabled && activePanelKey === "map" ? "auto" : "none"
                }
                zIndexRange={[50, 0]}
              >
                <MapPreview
                  variant={contentVariant}
                  showOpenButton={Boolean(
                    onRequestMapOpen && interactionsEnabled && activePanelKey === "map"
                  )}
                  onOpen={onRequestMapOpen}
                />
              </Html>
            );
          break;
        case "voltage":
          content = (
            <VoltageTemperatureChart3D
              data={chartData.data}
              variant={contentVariant}
            />
          );
          break;
        case "bottom":
          content = (
            <GaugeChart3D
              humidity={chartData.humidity}
              temperature={chartData.temperature}
              voltage={chartData.voltage}
              variant={contentVariant}
            />
          );
          break;
        default:
          content = null;
      }

      return {
        ...panel,
        content,
      };
    });
  }, [
    activePanelKey,
    chartData.data,
    chartData.humidity,
    chartData.temperature,
    chartData.voltage,
    contentLayout.mapHeight,
    contentLayout.width,
    contentVariant,
    interactionsEnabled,
    mode,
    onRequestMapOpen,
  ]);
}
