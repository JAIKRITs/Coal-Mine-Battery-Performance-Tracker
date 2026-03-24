import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import {
  CartesianGrid,
  Line,
  LineChart,
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
  const minValue = Math.min(...chartData.map((entry) => entry.value), 50);
  const maxValue = Math.max(...chartData.map((entry) => entry.value), 80);
  const padding = Math.max((maxValue - minValue) * 0.2, 1);

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
            }}
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: 14,
                    bottom: 8,
                    left: 14,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={PANEL_SURFACE_COLORS.grid}
                  />
                  <XAxis hide dataKey="index" />
                  <YAxis hide domain={[minValue - padding, maxValue + padding]} />
                  <Tooltip
                    contentStyle={getPanelTooltipStyle(layout)}
                    formatter={(value) => [`${Number(value).toFixed(1)} %`, "Humidity"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={PANEL_SURFACE_COLORS.humidity}
                    strokeWidth={variant === "sliderFocus" ? 3.2 : 2.5}
                    dot={false}
                    isAnimationActive={false}
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
