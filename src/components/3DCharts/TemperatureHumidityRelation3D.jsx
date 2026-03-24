import { Html } from "@react-three/drei";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateStats } from "../../utils/mockChartData";
import {
  getPanelCardStyle,
  getPanelContentLayout,
  getPanelTooltipStyle,
  PANEL_SURFACE_COLORS,
} from "../../utils/panelPresentation";

const STAT_LABELS = [
  { key: "max", label: "Max" },
  { key: "min", label: "Min" },
  { key: "mean", label: "Mean" },
];

export default function TemperatureHumidityRelation3D({
  data,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const scatterData = (Array.isArray(data) ? data : [])
    .map((entry) => ({
      temperature: Number(entry.temperature) || 0,
      humidity: Number(entry.humidity) || 0,
    }))
    .filter((entry) => entry.temperature > 0 && entry.humidity > 0);

  const humidityStats = calculateStats(data, "humidity");
  const temperatureStats = calculateStats(data, "temperature");

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
              letterSpacing: "0.01em",
            }}
          >
            Relation between temperature and humidity
          </h2>

          <div
            style={{
              display: "flex",
              gap: `${layout.gap}px`,
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ flex: 1, minHeight: 0 }}>
              {scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 10,
                      right: 18,
                      bottom: layout.axisFont >= 12 ? 26 : 20,
                      left: layout.axisFont >= 12 ? 14 : 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={PANEL_SURFACE_COLORS.grid}
                    />
                    <XAxis
                      type="number"
                      dataKey="temperature"
                      stroke={PANEL_SURFACE_COLORS.subdued}
                      tick={{
                        fill: PANEL_SURFACE_COLORS.subdued,
                        fontSize: layout.axisFont,
                      }}
                      label={{
                        value: "Temperature (deg C)",
                        position: "bottom",
                        offset: 6,
                        fill: PANEL_SURFACE_COLORS.subdued,
                        fontSize: layout.axisFont,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="humidity"
                      stroke={PANEL_SURFACE_COLORS.subdued}
                      tick={{
                        fill: PANEL_SURFACE_COLORS.subdued,
                        fontSize: layout.axisFont,
                      }}
                      label={{
                        value: "Humidity (%)",
                        angle: -90,
                        position: "left",
                        fill: PANEL_SURFACE_COLORS.subdued,
                        fontSize: layout.axisFont,
                      }}
                    />
                    <Tooltip
                      contentStyle={getPanelTooltipStyle(layout)}
                      cursor={{ strokeDasharray: "3 3" }}
                    />
                    <Scatter name="Humidity" data={scatterData} fill={PANEL_SURFACE_COLORS.humidity}>
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`${entry.temperature}-${entry.humidity}-${index}`}
                          fill={PANEL_SURFACE_COLORS.humidity}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div
              style={{
                width: `${layout.secondaryWidth}px`,
                flexShrink: 0,
                borderRadius: `${Math.max(14, layout.radius * 0.7)}px`,
                border: `1px solid ${PANEL_SURFACE_COLORS.divider}`,
                background: "rgba(255, 255, 255, 0.03)",
                padding: `${Math.max(10, layout.padding * 0.55)}px`,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: `${layout.statFont}px`,
                  color: "#d8e2ed",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PANEL_SURFACE_COLORS.divider}` }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0 0 10px 0",
                        color: PANEL_SURFACE_COLORS.subdued,
                        fontWeight: 500,
                      }}
                    >
                      Metric
                    </th>
                    {STAT_LABELS.map((stat) => (
                      <th
                        key={stat.key}
                        style={{
                          textAlign: "right",
                          padding: "0 0 10px 0",
                          color: PANEL_SURFACE_COLORS.subdued,
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Humidity",
                      color: PANEL_SURFACE_COLORS.humidity,
                      values: humidityStats,
                    },
                    {
                      label: "Temperature",
                      color: PANEL_SURFACE_COLORS.temperature,
                      values: temperatureStats,
                    },
                  ].map((row, rowIndex) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom:
                          rowIndex === 0
                            ? `1px solid ${PANEL_SURFACE_COLORS.divider}`
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 0",
                          color: row.color,
                          fontWeight: 500,
                        }}
                      >
                        {row.label}
                      </td>
                      {STAT_LABELS.map((stat) => (
                        <td
                          key={stat.key}
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                          }}
                        >
                          {row.values[stat.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
