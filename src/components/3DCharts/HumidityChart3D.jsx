import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import gsap from "gsap";
import {
  getPanelCardStyle,
  getPanelContentLayout,
  getPanelTooltipStyle,
  PANEL_SURFACE_COLORS,
} from "../../utils/panelPresentation";

const MIN_VISIBLE_SPAN = 3;
const MIN_PADDING = 0.4;

function getHumidityDomain(values) {
  if (values.length === 0) {
    return [0, 100];
  }

  const observedMin = Math.min(...values);
  const observedMax = Math.max(...values);
  const observedRange = observedMax - observedMin;
  const midpoint = (observedMin + observedMax) / 2;
  const effectiveRange = Math.max(observedRange, MIN_VISIBLE_SPAN);
  const padding = Math.max(effectiveRange * 0.18, MIN_PADDING);

  const rawMin = midpoint - effectiveRange / 2 - padding;
  const rawMax = midpoint + effectiveRange / 2 + padding;

  return [
    Math.max(0, Number(rawMin.toFixed(2))),
    Math.min(100, Number(rawMax.toFixed(2))),
  ];
}

export default function HumidityChart3D({
  humidity,
  data,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const displayValueRef = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animatedValue = { current: displayValueRef.current };

    const tween = gsap.to(animatedValue, {
      current: humidity,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        displayValueRef.current = animatedValue.current;
        setDisplayValue(animatedValue.current);
      },
    });

    return () => {
      tween.kill();
    };
  }, [humidity]);

  const chartData = (Array.isArray(data) ? data : []).slice(-20).map((entry) => ({
    index: entry.index || 0,
    value: Number(entry.humidity) || 0,
  }));
  const humidityValues = chartData
    .map((entry) => entry.value)
    .filter((value) => Number.isFinite(value));
  const [domainMin, domainMax] = getHumidityDomain(humidityValues);
  const latestPoint = chartData[chartData.length - 1] ?? null;

  return (
    <group>
      <Html
        transform
        position={[0, 0.05, 0.01]}
        distanceFactor={1.5}
        pointerEvents="none"
        zIndexRange={[50, 0]}
      >
        <div
          style={{
            ...getPanelCardStyle(layout),
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: `0 0 ${layout.titleSpacing}px 0`,
              fontSize: `${layout.titleSize}px`,
              color: PANEL_SURFACE_COLORS.title,
              fontWeight: 500,
            }}
          >
            Humidity monitoring
          </h2>

          <div
            style={{
              fontSize: `${layout.metricSize}px`,
              fontWeight: 600,
              color: PANEL_SURFACE_COLORS.humidity,
              margin: `${layout.metricSpacing || 10}px 0 0`,
              textShadow: "0 0 28px rgba(52, 211, 153, 0.28)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {displayValue.toFixed(1)}%
          </div>

          <div
            style={{
              width: "100%",
              height: `${layout.chartHeight}px`,
              marginTop: `${layout.titleSpacing}px`,
              padding: variant === "sliderFocus" ? "2px 0 0" : "0",
            }}
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: 14,
                    bottom: 8,
                    left: 14,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 6"
                    stroke="rgba(148, 163, 184, 0.11)"
                  />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={[domainMin, domainMax]} />
                  <ReferenceLine
                    y={domainMin}
                    stroke="rgba(255,255,255,0.08)"
                    ifOverflow="extendDomain"
                  />
                  <Tooltip
                    contentStyle={getPanelTooltipStyle(layout)}
                    formatter={(value) => [`${Number(value).toFixed(1)} %`, "Humidity"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={PANEL_SURFACE_COLORS.humidity}
                    strokeWidth={variant === "sliderFocus" ? 3.6 : 2.9}
                    fill={PANEL_SURFACE_COLORS.humidity}
                    fillOpacity={variant === "sliderFocus" ? 0.18 : 0.12}
                    activeDot={{
                      r: variant === "sliderFocus" ? 5.5 : 4,
                      fill: PANEL_SURFACE_COLORS.humidity,
                      stroke: "#eafff7",
                      strokeWidth: 1.5,
                    }}
                    dot={(dotProps) => {
                      const isLatestPoint =
                        latestPoint && dotProps.index === chartData.length - 1;

                      if (!isLatestPoint) {
                        return null;
                      }

                      return (
                        <circle
                          cx={dotProps.cx}
                          cy={dotProps.cy}
                          r={variant === "sliderFocus" ? 5 : 3.6}
                          fill={PANEL_SURFACE_COLORS.humidity}
                          stroke="#ecfdf5"
                          strokeWidth={1.5}
                        />
                      );
                    }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </Html>
    </group>
  );
}
