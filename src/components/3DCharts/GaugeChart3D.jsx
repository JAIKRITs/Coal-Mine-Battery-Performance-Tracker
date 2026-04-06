import { Html } from "@react-three/drei";
import {
  getPanelCardStyle,
  getPanelContentLayout,
  PANEL_SURFACE_COLORS,
} from "../../utils/panelPresentation";

function Gauge({ value, label, max, color, size, stroke, labelSize, valueSize }) {
  const percentage = (value / max) * 100;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg
          style={{
            transform: "rotate(-90deg)",
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(148, 163, 184, 0.26)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: `${valueSize}px`,
              fontWeight: 600,
              color: "#ffffff",
              textShadow: `0 0 18px ${color}40`,
            }}
          >
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      <span
        style={{
          marginTop: "12px",
          fontSize: `${labelSize}px`,
          color: PANEL_SURFACE_COLORS.subdued,
          textTransform: "capitalize",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function GaugeChart3D({
  humidity = 0,
  temperature = 0,
  voltage = 0,
  variant = "dashboard",
}) {
  const layout = getPanelContentLayout(variant);
  const expanded = variant === "sliderFocus";

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
            Sensor gauges
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              flex: 1,
              gap: `${layout.gap}px`,
            }}
          >
            <Gauge
              value={humidity}
              label="Humidity"
              max={100}
              color={PANEL_SURFACE_COLORS.humidity}
              size={layout.gaugeSize}
              stroke={layout.gaugeStroke}
              labelSize={expanded ? 16 : 12}
              valueSize={expanded ? 32 : 18}
            />
            <Gauge
              value={temperature}
              label="Temperature"
              max={50}
              color={PANEL_SURFACE_COLORS.temperature}
              size={layout.gaugeSize}
              stroke={layout.gaugeStroke}
              labelSize={expanded ? 16 : 12}
              valueSize={expanded ? 32 : 18}
            />
            <Gauge
              value={voltage}
              label="Voltage"
              max={15}
              color={PANEL_SURFACE_COLORS.voltage}
              size={layout.gaugeSize}
              stroke={layout.gaugeStroke}
              labelSize={expanded ? 16 : 12}
              valueSize={expanded ? 32 : 18}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
