import { useMemo, useState } from "react";
import { clampMapView, getStaticMapUrl, MAP_VIEW } from "../utils/mapConfig";
import {
  getPanelContentLayout,
  PANEL_SURFACE_COLORS,
} from "../utils/panelPresentation";

export default function MapPreview({
  variant = "dashboard",
  showOpenButton = false,
  onOpen,
}) {
  const layout = getPanelContentLayout(variant);
  const [view, setView] = useState(MAP_VIEW);
  const previewUrl = useMemo(
    () =>
      getStaticMapUrl({
        width: Math.round(layout.width * 2),
        height: Math.round(layout.mapHeight * 2),
        view,
      }),
    [layout.mapHeight, layout.width, view]
  );

  const stopEvent = (event) => {
    event.stopPropagation();
  };

  const updateView = (updater) => {
    setView((current) => clampMapView(updater(current)));
  };

  const zoomIn = () => updateView((current) => ({ ...current, zoom: current.zoom + 1 }));
  const zoomOut = () => updateView((current) => ({ ...current, zoom: current.zoom - 1 }));
  const resetBearing = () =>
    updateView((current) => ({ ...current, bearing: 0, pitch: MAP_VIEW.pitch }));

  const handleWheel = (event) => {
    event.stopPropagation();
    event.preventDefault();

    updateView((current) => ({
      ...current,
      zoom: current.zoom + (event.deltaY < 0 ? 0.6 : -0.6),
    }));
  };

  const controlButtonStyle = {
    width: `${layout.controlSize}px`,
    height: `${layout.controlSize}px`,
    border: 0,
    background: "rgba(255, 255, 255, 0.96)",
    color: "#111827",
    fontSize: `${layout.controlFontSize}px`,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      onPointerDown={stopEvent}
      onClick={stopEvent}
      onDoubleClick={stopEvent}
      onWheel={handleWheel}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: `${layout.radius}px`,
        overflow: "hidden",
        pointerEvents: "auto",
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92))",
      }}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Map preview of the tracked location"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cbd5e1",
            fontSize: `${Math.max(13, layout.axisFont + 2)}px`,
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: `${layout.padding}px`,
          }}
        >
          Map preview unavailable. Add `VITE_MAPBOX_TOKEN` to load the location.
        </div>
      )}

      {previewUrl ? (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          style={{
            position: "absolute",
            right: `${layout.innerInset}px`,
            top: `${layout.innerInset}px`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: `${Math.max(12, layout.radius * 0.5)}px`,
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.32)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(255, 255, 255, 0.92)",
          }}
        >
          <button type="button" onClick={zoomIn} style={controlButtonStyle} aria-label="Zoom in">
            +
          </button>
          <div style={{ height: "1px", background: "rgba(148, 163, 184, 0.4)" }} />
          <button type="button" onClick={zoomOut} style={controlButtonStyle} aria-label="Zoom out">
            -
          </button>
          <div style={{ height: "1px", background: "rgba(148, 163, 184, 0.4)" }} />
          <button
            type="button"
            onClick={resetBearing}
            style={{
              ...controlButtonStyle,
              fontSize: `${Math.max(15, layout.controlFontSize - 4)}px`,
              transform: `rotate(${view.bearing}deg)`,
              transition: "transform 0.2s ease",
            }}
            aria-label="Reset orientation"
            title="Reset orientation"
          >
            N
          </button>
        </div>
      ) : null}

      {showOpenButton && typeof onOpen === "function" ? (
        <button
          type="button"
          onPointerDown={stopEvent}
          onClick={(event) => {
            stopEvent(event);
            onOpen();
          }}
          style={{
            position: "absolute",
            left: `${layout.innerInset}px`,
            bottom: `${layout.innerInset}px`,
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.88)",
            color: "#fff",
            padding: layout.buttonPadding,
            fontSize: `${Math.max(12, layout.axisFont + 1)}px`,
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.32)",
          }}
        >
          Open Map
        </button>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: `${layout.innerInset}px`,
          top: `${layout.innerInset}px`,
          padding: "8px 12px",
          borderRadius: "999px",
          background: "rgba(8, 12, 18, 0.54)",
          color: PANEL_SURFACE_COLORS.title,
          fontSize: `${layout.subtitleSize}px`,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        Location tracing
      </div>
    </div>
  );
}
