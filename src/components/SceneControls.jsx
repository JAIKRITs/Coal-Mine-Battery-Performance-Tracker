import { useState, useEffect } from "react";

const BACKGROUNDS = [
  {
    name: "Clear Night",
    file: "rogland_clear_night_4k.exr",
  },
  {
    name: "Belfast Sunset 4k",
    file: "belfast_sunset_4k.exr",
  },
  {
    name: "Drakensberg Solitary Mountain 4k",
    file: "drakensberg_solitary_mountain_4k.exr",
  },
];

export default function SceneControls({ setEnvironmentFile }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedEnv") || BACKGROUNDS[0].file
  );

  useEffect(() => {
    setEnvironmentFile(selected);
    localStorage.setItem("selectedEnv", selected);
  }, [selected, setEnvironmentFile]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 10000,
        fontFamily: "sans-serif",
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        🎨 Background
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          style={{
            marginTop: "10px",
            background: "rgba(0,0,0,0.85)",
            padding: "10px",
            borderRadius: "10px",
            width: "180px",
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
          }}
        >
          {BACKGROUNDS.map((bg) => (
            <div
              key={bg.file}
              onClick={() => {
                setSelected(bg.file);
                setOpen(false);
              }}
              style={{
                padding: "8px",
                marginBottom: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                background:
                  selected === bg.file
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                color: "#fff",
                fontSize: "14px",
              }}
            >
              {bg.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}