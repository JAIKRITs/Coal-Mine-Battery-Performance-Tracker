import { useEffect, useRef, useState } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MAPBOX_TOKEN,
  MAP_LOCATION,
  MAP_OVERLAY_FLY_TO,
  MAP_VIEW,
} from "../utils/mapConfig";

export default function MapOverlay() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const open = () => {
      setVisible(true);
      setTimeout(() => setAnimateIn(true), 10);
    };

    const close = () => {
      setAnimateIn(false);
      setTimeout(() => setVisible(false), 400);
    };

    window.addEventListener("open-map", open);
    window.addEventListener("close-map", close);

    return () => {
      window.removeEventListener("open-map", open);
      window.removeEventListener("close-map", close);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !visible) return;
    mapRef.current.flyTo(MAP_OVERLAY_FLY_TO);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        backdropFilter: "blur(12px)",
        background: "rgba(0,0,0,0.6)",
        transition: "all 0.4s ease",
        opacity: animateIn ? 1 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,0,0,0.8)",
          transform: animateIn ? "scale(1)" : "scale(0.85)",
          transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={MAP_VIEW}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: "100%", height: "100%" }}
          onLoad={(e) => {
            const map = e.target;

            map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.terrain-rgb",
              tileSize: 512,
              maxzoom: 14,
            });

            map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

            map.addLayer({
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 14,
              paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  14,
                  0,
                  15,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  14,
                  0,
                  15,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
              },
            });
          }}
        >
          <Marker
            longitude={MAP_LOCATION.longitude}
            latitude={MAP_LOCATION.latitude}
            color="#ef4444"
          />
          <NavigationControl position="bottom-right" />
        </Map>
      </div>

      <button
        onClick={() => window.dispatchEvent(new Event("close-map"))}
        style={{
          position: "absolute",
          top: 30,
          right: 40,
          padding: "10px 18px",
          background: "#111",
          color: "#fff",
          border: "1px solid #444",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        x Close
      </button>
    </div>
  );
}
