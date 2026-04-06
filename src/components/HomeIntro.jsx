import { useCallback, useEffect, useRef, useState } from "react";
import XRScene from "../scenes/XRScene";
import "../styles/homeIntro.css";

const INTRO_LINES = [
  "Amaze with motion",
  "Illuminate data in space",
  "Guide decisions with clarity",
  "Enter the control interface",
];

const ENTER_TRANSITION_MS = 1300;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRelativePoint(clientX, clientY, target) {
  if (!target) {
    return { x: 50, y: 50 };
  }

  const rect = target.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;

  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
  };
}

export default function HomeIntro({ onEnter }) {
  const timeoutRef = useRef(null);
  const [isEntering, setIsEntering] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [portal, setPortal] = useState({ x: 50, y: 50 });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback((event) => {
    setPointer(getRelativePoint(event.clientX, event.clientY, event.currentTarget));
  }, []);

  const handleEnter = useCallback((event) => {
    if (isEntering) {
      return;
    }

    const nextPoint =
      event && typeof event.clientX === "number"
        ? getRelativePoint(event.clientX, event.clientY, event.currentTarget)
        : pointer;

    setPointer(nextPoint);
    setPortal(nextPoint);
    setIsEntering(true);

    timeoutRef.current = window.setTimeout(() => {
      onEnter?.();
    }, ENTER_TRANSITION_MS);
  }, [isEntering, onEnter, pointer]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handleEnter();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEnter]);

  return (
    <div
      className={`app-shell${isEntering ? " app-shell--entering" : ""}`}
      style={{
        "--pointer-x": `${pointer.x}%`,
        "--pointer-y": `${pointer.y}%`,
        "--portal-x": `${portal.x}%`,
        "--portal-y": `${portal.y}%`,
        "--enter-duration": `${ENTER_TRANSITION_MS}ms`,
      }}
    >
      <div className="scene-stage">
        <XRScene />
      </div>

      <button
        type="button"
        className={`intro-overlay${isEntering ? " intro-overlay--entering" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerDown={handleEnter}
        aria-label="Enter the experience"
      >
        <span className="intro-grid" aria-hidden="true" />
        <span className="intro-spotlight" aria-hidden="true" />
        <span className="intro-aperture" aria-hidden="true" />

        <span className="intro-content">
          <span className="intro-kicker">Spatial Monitoring Experience</span>
          <span className="intro-title">Coal Mine Battery Performance Tracker</span>

          <span className="intro-lines">
            {INTRO_LINES.map((line, index) => (
              <span
                key={line}
                className="intro-line"
                style={{ "--line-index": index }}
              >
                {line}
              </span>
            ))}
          </span>

          <span className="intro-instruction">Click to illuminate</span>
          <span className="intro-enter-pill">Enter</span>
        </span>
      </button>
    </div>
  );
}
