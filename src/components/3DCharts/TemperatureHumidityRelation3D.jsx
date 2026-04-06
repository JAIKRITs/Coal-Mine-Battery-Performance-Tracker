import { Html } from "@react-three/drei";
import { calculateStats } from "../../utils/mockChartData";
import {
  getPanelCardStyle,
  getPanelContentLayout,
  PANEL_SURFACE_COLORS,
} from "../../utils/panelPresentation";

const ATMOSPHERIC_PRESSURE_KPA = 101.325;
const RELATIVE_HUMIDITY_CURVES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const SVG_WIDTH = 760;
const SVG_HEIGHT = 420;
const SVG_PADDING = {
  top: 24,
  right: 26,
  bottom: 42,
  left: 58,
};
const DASHBOARD_OVERSAMPLE = 1.55;

function getSaturationVaporPressure(tempC) {
  return 0.61078 * Math.exp((17.2694 * tempC) / (tempC + 237.3));
}

function getHumidityRatio(tempC, relativeHumidity) {
  const humidityFraction = Math.min(Math.max(relativeHumidity, 0), 100) / 100;
  const vaporPressure = humidityFraction * getSaturationVaporPressure(tempC);
  const ratio = (0.62198 * vaporPressure) / (ATMOSPHERIC_PRESSURE_KPA - vaporPressure);
  return Math.max(0, ratio * 1000);
}

function getDewPoint(tempC, relativeHumidity) {
  const humidityFraction = Math.min(Math.max(relativeHumidity, 1), 100) / 100;
  const alpha =
    Math.log(humidityFraction) + (17.625 * tempC) / (243.04 + tempC);
  return (243.04 * alpha) / (17.625 - alpha);
}

function createScale(domainMin, domainMax, rangeMin, rangeMax) {
  const domainSpan = domainMax - domainMin || 1;
  const rangeSpan = rangeMax - rangeMin;
  return (value) => rangeMin + ((value - domainMin) / domainSpan) * rangeSpan;
}

function buildLinePath(points, scaleX, scaleY) {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${scaleX(point.x).toFixed(2)} ${scaleY(point.y).toFixed(2)}`;
    })
    .join(" ");
}

function formatMetric(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(digits);
}

export default function TemperatureHumidityRelation3D({
  data,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const isCompact = variant === "dashboard";
  const oversample = isCompact ? DASHBOARD_OVERSAMPLE : 1;
  const cardWidth = layout.width * oversample;
  const cardHeight = layout.height * oversample;
  const visibleCurveLevels = isCompact
    ? [20, 40, 60, 80, 100]
    : RELATIVE_HUMIDITY_CURVES;
  const psychrometricPoints = (Array.isArray(data) ? data : [])
    .slice(isCompact ? -10 : -24)
    .map((entry, index) => {
      const temperature = Number(entry.temperature) || 0;
      const relativeHumidity = Number(entry.humidity) || 0;
      const humidityRatio = getHumidityRatio(temperature, relativeHumidity);

      return {
        id: `${entry.ts ?? entry.timestamp ?? index}-${index}`,
        temperature,
        relativeHumidity,
        humidityRatio,
        dewPoint: getDewPoint(temperature, relativeHumidity),
        timestamp: entry.timestamp,
      };
    })
    .filter(
      (entry) =>
        entry.temperature > 0 &&
        entry.relativeHumidity > 0 &&
        Number.isFinite(entry.humidityRatio)
    );

  const latestPoint =
    psychrometricPoints[psychrometricPoints.length - 1] ?? null;
  const temperatureStats = calculateStats(data, "temperature");
  const humidityStats = calculateStats(data, "humidity");
  const xMin = 10;
  const rawXMax = Math.max(
    40,
    ...psychrometricPoints.map((entry) => entry.temperature + 2)
  );
  const xMax = Math.min(50, Math.ceil(rawXMax / 5) * 5);
  const saturationAtMax = getHumidityRatio(xMax, 100);
  const rawYMax = Math.max(
    20,
    saturationAtMax,
    ...psychrometricPoints.map((entry) => entry.humidityRatio + 1)
  );
  const yMax = Math.ceil(rawYMax / 5) * 5;

  const plotWidth = SVG_WIDTH - SVG_PADDING.left - SVG_PADDING.right;
  const plotHeight = SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom;
  const scaleX = createScale(xMin, xMax, SVG_PADDING.left, SVG_PADDING.left + plotWidth);
  const scaleY = createScale(0, yMax, SVG_PADDING.top + plotHeight, SVG_PADDING.top);

  const temperatureTicks = [];
  for (let value = xMin; value <= xMax; value += 5) {
    temperatureTicks.push(value);
  }

  const humidityRatioTicks = [];
  for (let value = 0; value <= yMax; value += 5) {
    humidityRatioTicks.push(value);
  }

  const curvePaths = visibleCurveLevels.map((relativeHumidity) => {
    const points = [];

    for (let temp = xMin; temp <= xMax; temp += 1) {
      const humidityRatio = getHumidityRatio(temp, relativeHumidity);
      if (humidityRatio <= yMax) {
        points.push({ x: temp, y: humidityRatio });
      }
    }

    return {
      relativeHumidity,
      path: buildLinePath(points, scaleX, scaleY),
      labelPoint: points[Math.max(points.length - 1, 0)] ?? null,
    };
  });

  return (
    <group>
      <Html
        transform
        position={[0, 0.07, 0.01]}
        distanceFactor={1.5}
        pointerEvents="none"
        zIndexRange={[50, 0]}
        style={
          isCompact
            ? {
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                overflow: "hidden",
              }
            : undefined
        }
      >
        <div
          style={{
            ...getPanelCardStyle(layout),
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            transform: isCompact ? `scale(${1 / oversample})` : "none",
            transformOrigin: "top left",
          }}
        >
          <h2
            style={{
              margin: `0 0 ${isCompact ? 6 : layout.titleSpacing}px 0`,
              fontSize: `${isCompact ? layout.titleSize * 1.18 : layout.titleSize}px`,
              color: PANEL_SURFACE_COLORS.title,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Psychrometric chart
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: isCompact ? "column" : "row",
              gap: `${isCompact ? 8 : layout.gap}px`,
              flex: 1,
              minHeight: 0,
            }}
          >
            {isCompact ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                {[
                  {
                    label: "Dry bulb",
                    value: `${formatMetric(latestPoint?.temperature ?? 0)} deg C`,
                    color: PANEL_SURFACE_COLORS.temperature,
                  },
                  {
                    label: "Rel. humidity",
                    value: `${formatMetric(latestPoint?.relativeHumidity ?? 0)} %`,
                    color: PANEL_SURFACE_COLORS.humidity,
                  },
                  {
                    label: "Humidity ratio",
                    value: `${formatMetric(latestPoint?.humidityRatio ?? 0)} g/kg`,
                    color: PANEL_SURFACE_COLORS.title,
                  },
                  {
                    label: "Dew point",
                    value: `${formatMetric(latestPoint?.dewPoint ?? 0)} deg C`,
                    color: PANEL_SURFACE_COLORS.subdued,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderRadius: `${Math.max(10, layout.radius * 0.55)}px`,
                      border: `1px solid ${PANEL_SURFACE_COLORS.divider}`,
                      background: "rgba(255, 255, 255, 0.025)",
                      padding: "8px 10px",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: PANEL_SURFACE_COLORS.subdued,
                        fontSize: `${Math.max(9, layout.subtitleSize)}px`,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: item.color,
                        fontSize: `${Math.max(10, layout.statFont + 1)}px`,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div
              style={{
                flex: 1,
                minHeight: 0,
                borderRadius: `${Math.max(14, layout.radius * 0.75)}px`,
                border: `1px solid ${PANEL_SURFACE_COLORS.divider}`,
                background: "rgba(255, 255, 255, 0.025)",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
              >
                <rect
                  x="0"
                  y="0"
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  fill="rgba(7, 10, 15, 0.38)"
                />

                {humidityRatioTicks.map((tick) => (
                  <g key={`y-${tick}`}>
                    <line
                      x1={SVG_PADDING.left}
                      y1={scaleY(tick)}
                      x2={SVG_PADDING.left + plotWidth}
                      y2={scaleY(tick)}
                      stroke={PANEL_SURFACE_COLORS.grid}
                      strokeDasharray="4 6"
                    />
                    <text
                      x={SVG_PADDING.left - 12}
                      y={scaleY(tick) + 4}
                      textAnchor="end"
                      fill={PANEL_SURFACE_COLORS.subdued}
                      fontSize={isCompact ? layout.axisFont + 2 : layout.axisFont + 1}
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {temperatureTicks.map((tick) => (
                  <g key={`x-${tick}`}>
                    <line
                      x1={scaleX(tick)}
                      y1={SVG_PADDING.top}
                      x2={scaleX(tick)}
                      y2={SVG_PADDING.top + plotHeight}
                      stroke={PANEL_SURFACE_COLORS.grid}
                      strokeDasharray="4 6"
                    />
                    <text
                      x={scaleX(tick)}
                      y={SVG_PADDING.top + plotHeight + 24}
                      textAnchor="middle"
                      fill={PANEL_SURFACE_COLORS.subdued}
                      fontSize={isCompact ? layout.axisFont + 2 : layout.axisFont + 1}
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {curvePaths.map((curve) => (
                  <g key={`curve-${curve.relativeHumidity}`}>
                    <path
                      d={curve.path}
                      fill="none"
                      stroke={
                        curve.relativeHumidity === 100
                          ? PANEL_SURFACE_COLORS.temperature
                          : "rgba(148, 163, 184, 0.46)"
                      }
                      strokeWidth={curve.relativeHumidity === 100 ? 2.6 : 1.25}
                    />
                    {curve.labelPoint && curve.relativeHumidity % 20 === 0 ? (
                      <text
                        x={scaleX(curve.labelPoint.x) - 4}
                        y={scaleY(curve.labelPoint.y) - 6}
                        textAnchor="end"
                        fill={PANEL_SURFACE_COLORS.subdued}
                        fontSize={
                          isCompact ? Math.max(8, layout.axisFont + 1) : layout.axisFont
                        }
                      >
                        {curve.relativeHumidity}%
                      </text>
                    ) : null}
                  </g>
                ))}

                <line
                  x1={SVG_PADDING.left}
                  y1={SVG_PADDING.top + plotHeight}
                  x2={SVG_PADDING.left + plotWidth}
                  y2={SVG_PADDING.top + plotHeight}
                  stroke="rgba(255,255,255,0.18)"
                />
                <line
                  x1={SVG_PADDING.left}
                  y1={SVG_PADDING.top}
                  x2={SVG_PADDING.left}
                  y2={SVG_PADDING.top + plotHeight}
                  stroke="rgba(255,255,255,0.18)"
                />

                {psychrometricPoints.map((point, index) => {
                  const isLatest = index === psychrometricPoints.length - 1;
                  return (
                    <g key={point.id}>
                      <circle
                        cx={scaleX(point.temperature)}
                        cy={scaleY(point.humidityRatio)}
                        r={isCompact ? (isLatest ? 5.2 : 3.2) : isLatest ? 6.5 : 4.2}
                        fill={
                          isLatest
                            ? PANEL_SURFACE_COLORS.temperature
                            : PANEL_SURFACE_COLORS.humidity
                        }
                        fillOpacity={isLatest ? 0.96 : 0.78}
                        stroke="rgba(10, 14, 20, 0.9)"
                        strokeWidth={isLatest ? 2.2 : 1.1}
                      />
                      {isLatest ? (
                        <circle
                        cx={scaleX(point.temperature)}
                        cy={scaleY(point.humidityRatio)}
                        r={isCompact ? 8 : 10}
                        fill="none"
                        stroke={PANEL_SURFACE_COLORS.temperature}
                        strokeOpacity="0.28"
                          strokeWidth="2"
                        />
                      ) : null}
                    </g>
                  );
                })}

                <text
                  x={SVG_PADDING.left + plotWidth / 2}
                  y={SVG_HEIGHT - 8}
                  textAnchor="middle"
                  fill={PANEL_SURFACE_COLORS.subdued}
                  fontSize={isCompact ? layout.axisFont + 3 : layout.axisFont + 2}
                >
                  Dry bulb temperature (deg C)
                </text>
                <text
                  x={18}
                  y={SVG_PADDING.top + plotHeight / 2}
                  transform={`rotate(-90 18 ${SVG_PADDING.top + plotHeight / 2})`}
                  textAnchor="middle"
                  fill={PANEL_SURFACE_COLORS.subdued}
                  fontSize={isCompact ? layout.axisFont + 3 : layout.axisFont + 2}
                >
                  Humidity ratio (g/kg)
                </text>
              </svg>
            </div>

            {!isCompact ? (
              <div
                style={{
                  width: `${layout.secondaryWidth}px`,
                  flexShrink: 0,
                  borderRadius: `${Math.max(14, layout.radius * 0.7)}px`,
                  border: `1px solid ${PANEL_SURFACE_COLORS.divider}`,
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: `${Math.max(10, layout.padding * 0.55)}px`,
                  display: "flex",
                  flexDirection: "column",
                  gap: `${Math.max(10, layout.gap * 0.55)}px`,
                }}
              >
                <div>
                  <div
                    style={{
                      color: PANEL_SURFACE_COLORS.subdued,
                      fontSize: `${layout.subtitleSize}px`,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                    }}
                  >
                    Latest State
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "8px 12px",
                      fontSize: `${layout.statFont}px`,
                      color: "#d8e2ed",
                    }}
                  >
                    <span>Dry bulb</span>
                    <span>{formatMetric(latestPoint?.temperature ?? 0)} deg C</span>
                    <span>Relative humidity</span>
                    <span>{formatMetric(latestPoint?.relativeHumidity ?? 0)} %</span>
                    <span>Humidity ratio</span>
                    <span>{formatMetric(latestPoint?.humidityRatio ?? 0)} g/kg</span>
                    <span>Dew point</span>
                    <span>{formatMetric(latestPoint?.dewPoint ?? 0)} deg C</span>
                  </div>
                </div>

                <div
                  style={{
                    height: "1px",
                    background: PANEL_SURFACE_COLORS.divider,
                  }}
                />

                <div>
                  <div
                    style={{
                      color: PANEL_SURFACE_COLORS.subdued,
                      fontSize: `${layout.subtitleSize}px`,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                    }}
                  >
                    Dummy Data Range
                  </div>
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
                            paddingBottom: "8px",
                            color: PANEL_SURFACE_COLORS.subdued,
                            fontWeight: 500,
                          }}
                        >
                          Metric
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            paddingBottom: "8px",
                            color: PANEL_SURFACE_COLORS.subdued,
                            fontWeight: 500,
                          }}
                        >
                          Min
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            paddingBottom: "8px",
                            color: PANEL_SURFACE_COLORS.subdued,
                            fontWeight: 500,
                          }}
                        >
                          Max
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "10px 0",
                            color: PANEL_SURFACE_COLORS.temperature,
                            fontWeight: 500,
                          }}
                        >
                          Temperature
                        </td>
                        <td style={{ textAlign: "right" }}>{temperatureStats.min}</td>
                        <td style={{ textAlign: "right" }}>{temperatureStats.max}</td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "10px 0 0",
                            color: PANEL_SURFACE_COLORS.humidity,
                            fontWeight: 500,
                          }}
                        >
                          Rel. humidity
                        </td>
                        <td style={{ textAlign: "right", paddingTop: "10px" }}>
                          {humidityStats.min}
                        </td>
                        <td style={{ textAlign: "right", paddingTop: "10px" }}>
                          {humidityStats.max}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Html>
    </group>
  );
}
