import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_BACKGROUND_CONFIG,
  GRADIENT_PRESETS,
  HDRI_BACKGROUNDS,
} from "../utils/backgroundConfig.js";

const actionButtonStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(17,17,17,0.92)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

export default function SceneControls({
  backgroundConfig = DEFAULT_BACKGROUND_CONFIG,
  setBackgroundConfig,
  priorityAction = null,
  actions = [],
  footerActions = [],
}) {
  const [open, setOpen] = useState(false);
  const [popupMetrics, setPopupMetrics] = useState({ top: 82, maxHeight: 420 });
  const backgroundButtonRef = useRef(null);
  const isGradient = backgroundConfig.type === "gradient";
  const activeHdriFile = backgroundConfig.hdriFile || DEFAULT_BACKGROUND_CONFIG.hdriFile;
  const gradientColors =
    backgroundConfig.gradientColors || DEFAULT_BACKGROUND_CONFIG.gradientColors;

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePopupMetrics = () => {
      const buttonRect = backgroundButtonRef.current?.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const top = Math.max(16, (buttonRect?.bottom || 72) + 10);
      const maxHeight = Math.max(240, viewportHeight - top - 16);

      setPopupMetrics({
        top,
        maxHeight,
      });
    };

    updatePopupMetrics();
    window.addEventListener("resize", updatePopupMetrics);
    window.visualViewport?.addEventListener("resize", updatePopupMetrics);
    window.visualViewport?.addEventListener("scroll", updatePopupMetrics);

    return () => {
      window.removeEventListener("resize", updatePopupMetrics);
      window.visualViewport?.removeEventListener("resize", updatePopupMetrics);
      window.visualViewport?.removeEventListener("scroll", updatePopupMetrics);
    };
  }, [open]);

  const handleHdriSelect = (file) => {
    setBackgroundConfig((currentConfig) => ({
      ...currentConfig,
      type: "hdri",
      hdriFile: file,
      motion: "subtle",
    }));
    setOpen(false);
  };

  const handleGradientSelect = () => {
    setBackgroundConfig((currentConfig) => ({
      ...currentConfig,
      type: "gradient",
      hdriFile: currentConfig.hdriFile || DEFAULT_BACKGROUND_CONFIG.hdriFile,
      motion: "subtle",
    }));
  };

  const handleGradientPresetSelect = (preset) => {
    setBackgroundConfig((currentConfig) => ({
      ...currentConfig,
      type: "gradient",
      hdriFile: currentConfig.hdriFile || DEFAULT_BACKGROUND_CONFIG.hdriFile,
      gradientPresetId: preset.id,
      gradientColors: [...preset.colors],
      motion: "subtle",
    }));
  };

  const handleGradientColorChange = (index, nextColor) => {
    setBackgroundConfig((currentConfig) => ({
      ...currentConfig,
      type: "gradient",
      hdriFile: currentConfig.hdriFile || DEFAULT_BACKGROUND_CONFIG.hdriFile,
      gradientPresetId: "custom",
      gradientColors: (
        currentConfig.gradientColors || DEFAULT_BACKGROUND_CONFIG.gradientColors
      ).map((color, colorIndex) =>
        colorIndex === index ? nextColor : color
      ),
      motion: "subtle",
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 10000,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
      }}
    >
      {priorityAction ? priorityAction : null}

      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          style={actionButtonStyle}
        >
          {action.label}
        </button>
      ))}

      <button
        ref={backgroundButtonRef}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        style={{
          ...actionButtonStyle,
          border: "none",
        }}
      >
        Background
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: popupMetrics.top,
            right: 20,
            background: "rgba(0,0,0,0.85)",
            borderRadius: "10px",
            width: "260px",
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            overscrollBehavior: "contain",
            display: "flex",
            flexDirection: "column",
            maxHeight: `${popupMetrics.maxHeight}px`,
          }}
        >
          <div
            style={{
              padding: "12px 12px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.56)",
            }}
          >
            Background
          </div>

          <div
            style={{
              padding: "12px",
              paddingBottom: "18px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div
              style={{
                marginBottom: "8px",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.56)",
              }}
            >
              HDRI Backgrounds
            </div>

            {HDRI_BACKGROUNDS.map((background) => (
              <button
                key={background.file}
                type="button"
                onClick={() => handleHdriSelect(background.file)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    !isGradient && activeHdriFile === background.file
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.03)",
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "left",
                }}
              >
                {background.name}
              </button>
            ))}

            <div
              style={{
                marginTop: "14px",
                marginBottom: "8px",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.56)",
              }}
            >
              Gradient Mode
            </div>

            <button
              type="button"
              onClick={handleGradientSelect}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                background: isGradient
                  ? "linear-gradient(135deg, rgba(18, 44, 80, 0.95), rgba(100, 150, 255, 0.72))"
                  : "rgba(255,255,255,0.03)",
                color: "#fff",
                fontSize: "14px",
                textAlign: "left",
              }}
            >
              Gradient
            </button>

            {isGradient && (
              <>
                <div
                  style={{
                    marginTop: "12px",
                    marginBottom: "8px",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.56)",
                  }}
                >
                  Presets
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "6px",
                  }}
                >
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleGradientPresetSelect(preset)}
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        border:
                          backgroundConfig.gradientPresetId === preset.id
                            ? "1px solid rgba(255,255,255,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        color: "#fff",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          height: "28px",
                          borderRadius: "999px",
                          marginBottom: "6px",
                          background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]}, ${preset.colors[2]})`,
                          boxShadow:
                            backgroundConfig.gradientPresetId === preset.id
                              ? "0 0 0 1px rgba(255,255,255,0.22) inset"
                              : "none",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: 1.2,
                          color: "rgba(255,255,255,0.88)",
                        }}
                      >
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    marginBottom: "8px",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.56)",
                  }}
                >
                  Custom Colors
                </div>

                {gradientColors.map((color, index) => (
                  <label
                    key={`gradient-color-${index + 1}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: index === gradientColors.length - 1 ? 10 : "8px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ width: "56px", color: "rgba(255,255,255,0.72)" }}>
                      Stop {index + 1}
                    </span>
                    <input
                      type="color"
                      value={color}
                      onChange={(event) => handleGradientColorChange(index, event.target.value)}
                      style={{
                        width: "42px",
                        height: "34px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {color.toUpperCase()}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {footerActions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          style={actionButtonStyle}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
