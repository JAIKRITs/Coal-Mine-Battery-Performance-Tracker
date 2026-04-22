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
  setEnvironmentFile,
  actions = [],
  footerActions = [],
}) {
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
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
      }}
    >
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
            background: "rgba(0,0,0,0.85)",
            padding: "10px",
            borderRadius: "10px",
            width: "180px",
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
          }}
        >
          {BACKGROUNDS.map((bg, index) => (
            <div
              key={bg.file}
              onClick={() => {
                setSelected(bg.file);
                setOpen(false);
              }}
              style={{
                padding: "8px",
                marginBottom: index === BACKGROUNDS.length - 1 ? 0 : "6px",
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
