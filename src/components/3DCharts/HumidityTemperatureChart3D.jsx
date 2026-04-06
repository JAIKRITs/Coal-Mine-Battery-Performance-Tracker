import { Html } from "@react-three/drei";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getPanelCardStyle,
  getPanelContentLayout,
  getPanelTooltipStyle,
  PANEL_SURFACE_COLORS,
} from "../../utils/panelPresentation";

export default function HumidityTemperatureChart3D({
  data,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const chartData = (Array.isArray(data) ? data : []).slice(-20).map((entry) => {
    const humidityValue =
      typeof entry.humidity === "number"
        ? entry.humidity
        : parseFloat(entry.humidity) || 0;
    const temperatureValue =
      typeof entry.temperature === "number"
        ? entry.temperature
        : parseFloat(entry.temperature) || 0;

    return {
      time: new Date(entry.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: variant === "sliderFocus" ? "2-digit" : undefined,
      }),
      humidity: parseFloat(Math.max(0, Math.min(100, humidityValue)).toFixed(2)),
      temperature: parseFloat(Math.max(0, Math.min(50, temperatureValue)).toFixed(2)),
    };
  });

  const validHumidity = chartData.filter((entry) => entry.humidity > 0);
  const validTemperature = chartData.filter((entry) => entry.temperature > 0);
  const humidityMin =
    validHumidity.length > 0
      ? Math.min(...validHumidity.map((entry) => entry.humidity))
      : 60;
  const humidityMax =
    validHumidity.length > 0
      ? Math.max(...validHumidity.map((entry) => entry.humidity))
      : 75;
  const temperatureMin =
    validTemperature.length > 0
      ? Math.min(...validTemperature.map((entry) => entry.temperature))
      : 25;
  const temperatureMax =
    validTemperature.length > 0
      ? Math.max(...validTemperature.map((entry) => entry.temperature))
      : 35;
  const humidityPadding = Math.max((humidityMax - humidityMin) * 0.15, 1);
  const temperaturePadding = Math.max((temperatureMax - temperatureMin) * 0.15, 1);

  return (
    <group>
      <Html
        transform
        position={[0, 0.07, 0.01]}
        distanceFactor={1.5}
        pointerEvents="none"
        zIndexRange={[50, 0]}
      >
        <div style={getPanelCardStyle(layout)}>
          <h2
            style={{
              margin: `0 0 ${layout.titleSpacing}px 0`,
              fontSize: `${layout.titleSize}px`,
              color: PANEL_SURFACE_COLORS.title,
              fontWeight: 500,
            }}
          >
            Temperature and humidity timeline
          </h2>

          <div style={{ flex: 1, minHeight: 0 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: layout.axisFont >= 12 ? 20 : 15,
                    bottom: layout.axisFont >= 12 ? 24 : 20,
                    left: layout.axisFont >= 12 ? 16 : 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={PANEL_SURFACE_COLORS.grid}
                  />
                  <XAxis
                    dataKey="time"
                    stroke={PANEL_SURFACE_COLORS.subdued}
                    tick={{
                      fill: PANEL_SURFACE_COLORS.subdued,
                      fontSize: layout.axisFont,
                    }}
                  />
                  <YAxis
                    yAxisId="humidity"
                    domain={[humidityMin - humidityPadding, humidityMax + humidityPadding]}
                    stroke={PANEL_SURFACE_COLORS.humidity}
                    tick={{
                      fill: PANEL_SURFACE_COLORS.humidity,
                      fontSize: layout.axisFont,
                    }}
                  />
                  <YAxis
                    yAxisId="temperature"
                    orientation="right"
                    domain={[
                      temperatureMin - temperaturePadding,
                      temperatureMax + temperaturePadding,
                    ]}
                    stroke={PANEL_SURFACE_COLORS.temperature}
                    tick={{
                      fill: PANEL_SURFACE_COLORS.temperature,
                      fontSize: layout.axisFont,
                    }}
                  />
                  <Tooltip
                    contentStyle={getPanelTooltipStyle(layout)}
                    formatter={(value, key) =>
                      key === "humidity"
                        ? [`${Number(value).toFixed(2)} %`, "Humidity"]
                        : [`${Number(value).toFixed(2)} deg C`, "Temperature"]
                    }
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: `${layout.legendFont}px`,
                      paddingTop: "10px",
                    }}
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humidity"
                    stroke={PANEL_SURFACE_COLORS.humidity}
                    strokeWidth={variant === "sliderFocus" ? 2.8 : 2}
                    dot={false}
                    isAnimationActive={false}
                    name="Humidity"
                  />
                  <Line
                    yAxisId="temperature"
                    type="monotone"
                    dataKey="temperature"
                    stroke={PANEL_SURFACE_COLORS.temperature}
                    strokeWidth={variant === "sliderFocus" ? 2.8 : 2}
                    dot={false}
                    isAnimationActive={false}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </Html>
    </group>
  );
}
