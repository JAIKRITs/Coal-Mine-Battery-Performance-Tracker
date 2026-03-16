import { useMemo, useState } from "react";
import { clampMapView, getStaticMapUrl, MAP_VIEW } from "../utils/mapConfig";

export default function MapPreview() {
  const [view, setView] = useState(MAP_VIEW);

  const previewUrl = useMemo(
    () =>
      getStaticMapUrl({
        width: 720,
        height: 360,
        view,
      }),
    [view]
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
    width: "32px",
    height: "32px",
    border: 0,
    background: "rgba(255, 255, 255, 0.96)",
    color: "#111827",
    fontSize: "20px",
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
        borderRadius: "12px",
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
            fontSize: "13px",
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: "16px",
          }}
        >
          Map preview unavailable. Add `VITE_MAPBOX_TOKEN` to load the location.
        </div>
      )}

      {previewUrl && (
        <div
          onPointerDown={stopEvent}
          onClick={stopEvent}
          style={{
            position: "absolute",
            right: "12px",
            top: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "8px",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.32)",
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
              fontSize: "15px",
              transform: `rotate(${view.bearing}deg)`,
              transition: "transform 0.2s ease",
            }}
            aria-label="Reset orientation"
            title="Reset orientation"
          >
            N
          </button>
        </div>
      )}
    </div>
  );
}
