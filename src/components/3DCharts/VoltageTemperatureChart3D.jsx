import { Html } from "@react-three/drei";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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

export default function VoltageTemperatureChart3D({
  data,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const chartData = (Array.isArray(data) ? data : []).slice(-10).map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: variant === "sliderFocus" ? "2-digit" : undefined,
    }),
    voltage: Number(entry.voltage) || 0,
    temperature: Number(entry.temperature) || 0,
  }));

  const voltageValues = chartData
    .map((entry) => entry.voltage)
    .filter((value) => !Number.isNaN(value));
  const temperatureValues = chartData
    .map((entry) => entry.temperature)
    .filter((value) => !Number.isNaN(value));

  if (voltageValues.length === 0 || temperatureValues.length === 0) {
    return null;
  }

  const voltageMin = Math.max(Math.min(...voltageValues) - 0.5, 0);
  const voltageMax = Math.min(Math.max(...voltageValues) + 0.5, 15);
  const temperatureMin = Math.max(Math.min(...temperatureValues) - 0.5, 0);
  const temperatureMax = Math.min(Math.max(...temperatureValues) + 0.5, 50);
  const voltageRange = voltageMax - voltageMin || 0.1;
  const temperatureRange = temperatureMax - temperatureMin || 1;
  const normalizedData = chartData.map((entry) => ({
    ...entry,
    voltageNormalized: ((entry.voltage - voltageMin) / voltageRange) * 100,
    temperatureNormalized: ((entry.temperature - temperatureMin) / temperatureRange) * 100,
  }));

  return (
    <group>
      <Html
        transform
        position={[0, 0.05, 0.01]}
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
            Voltage and temperature
          </h2>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={normalizedData}
                margin={{
                  top: 10,
                  right: layout.axisFont >= 12 ? 28 : 22,
                  bottom: layout.axisFont >= 12 ? 24 : 20,
                  left: 10,
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
                  yAxisId="voltage"
                  stroke={PANEL_SURFACE_COLORS.voltage}
                  domain={[0, 100]}
                  tick={{
                    fill: PANEL_SURFACE_COLORS.voltage,
                    fontSize: layout.axisFont,
                  }}
                  tickFormatter={(value) =>
                    (voltageMin + (value / 100) * voltageRange).toFixed(2)
                  }
                />
                <YAxis
                  yAxisId="temperature"
                  orientation="right"
                  stroke={PANEL_SURFACE_COLORS.temperature}
                  domain={[0, 100]}
                  tick={{
                    fill: PANEL_SURFACE_COLORS.temperature,
                    fontSize: layout.axisFont,
                  }}
                  tickFormatter={(value) =>
                    (temperatureMin + (value / 100) * temperatureRange).toFixed(1)
                  }
                />
                <Tooltip
                  contentStyle={getPanelTooltipStyle(layout)}
                  formatter={(value, name, props) =>
                    name === "Voltage"
                      ? [`${props.payload.voltage.toFixed(2)} V`, "Voltage"]
                      : [`${props.payload.temperature.toFixed(1)} deg C`, "Temperature"]
                  }
                />
                <Legend
                  wrapperStyle={{
                    fontSize: `${layout.legendFont}px`,
                    paddingTop: "10px",
                  }}
                />
                <Bar
                  yAxisId="voltage"
                  dataKey="voltageNormalized"
                  fill={PANEL_SURFACE_COLORS.voltage}
                  name="Voltage"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="temperature"
                  type="monotone"
                  dataKey="temperatureNormalized"
                  stroke={PANEL_SURFACE_COLORS.temperature}
                  strokeWidth={variant === "sliderFocus" ? 2.8 : 2}
                  dot={false}
                  name="Temperature"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Html>
    </group>
  );
}
