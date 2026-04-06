import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Panel3D from "./Panel3D";

const DRAG_SENSITIVITY = 0.005;
const ACTIVE_X_RANGE = 4.2;
const HINT_X_BASE = 4.8;

function clampIndex(value, panelCount) {
  return THREE.MathUtils.clamp(value, 0, Math.max(panelCount - 1, 0));
}

function getPanelTransform(relativeIndex) {
  const absoluteIndex = Math.abs(relativeIndex);
  const sign = Math.sign(relativeIndex) || 1;
  const primaryTravel = Math.min(absoluteIndex, 1);
  const overflowTravel = Math.max(absoluteIndex - 1, 0);
  const x =
    sign *
    (THREE.MathUtils.lerp(0, ACTIVE_X_RANGE, primaryTravel) +
      overflowTravel * HINT_X_BASE);
  const z = THREE.MathUtils.lerp(0.48, -1.4, primaryTravel) - overflowTravel * 0.32;
  const y = 0;
  const scale = THREE.MathUtils.lerp(1, 0.38, primaryTravel) * Math.max(0.72, 1 - overflowTravel * 0.18);
  const rotationY = -sign * THREE.MathUtils.lerp(0, 0.36, primaryTravel);

  return { x, y, z, scale, rotationY };
}

export default function PanelSliderReel({
  panels,
  onActivePanelChange,
  onRequestMapOpen,
}) {
  const panelRefs = useRef([]);
  const dragStateRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startTarget: 0,
    moved: false,
  });
  const displayIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const commitIndex = useCallback(
    (nextValue, snap = false) => {
      const normalizedValue = clampIndex(
        snap ? Math.round(nextValue) : nextValue,
        panels.length
      );

      targetIndexRef.current = normalizedValue;

      const nextIndex = Math.round(normalizedValue);
      setActiveIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex
      );
    },
    [panels.length]
  );

  useEffect(() => {
    onActivePanelChange?.(panels[activeIndex]?.key ?? null);
  }, [activeIndex, onActivePanelChange, panels]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        commitIndex(targetIndexRef.current + 1, true);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        commitIndex(targetIndexRef.current - 1, true);
      }

      if (event.key === "Enter" && panels[activeIndex]?.key === "map") {
        onRequestMapOpen?.();
      }
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) < 1 && Math.abs(event.deltaX) < 1) {
        return;
      }

      event.preventDefault();
      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      commitIndex(targetIndexRef.current + dominantDelta * 0.0022, false);
      window.clearTimeout(handleWheel.timeoutId);
      handleWheel.timeoutId = window.setTimeout(() => {
        commitIndex(targetIndexRef.current, true);
      }, 140);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.clearTimeout(handleWheel.timeoutId);
    };
  }, [activeIndex, commitIndex, onRequestMapOpen, panels]);

  useFrame(() => {
    const lerpFactor = dragStateRef.current.active ? 0.18 : 0.12;
    displayIndexRef.current = THREE.MathUtils.lerp(
      displayIndexRef.current,
      targetIndexRef.current,
      lerpFactor
    );

    panelRefs.current.forEach((group, index) => {
      if (!group) {
        return;
      }

      const transform = getPanelTransform(index - displayIndexRef.current);

      group.position.x += (transform.x - group.position.x) * 0.12;
      group.position.y += (transform.y - group.position.y) * 0.12;
      group.position.z += (transform.z - group.position.z) * 0.12;
      group.rotation.y += (transform.rotationY - group.rotation.y) * 0.12;
      group.scale.x += (transform.scale - group.scale.x) * 0.12;
      group.scale.y += (transform.scale - group.scale.y) * 0.12;
      group.scale.z += (transform.scale - group.scale.z) * 0.12;
    });
  });

  const beginDrag = (event) => {
    dragStateRef.current.active = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startTarget = targetIndexRef.current;
    dragStateRef.current.moved = false;
    event.target.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (
      !dragStateRef.current.active ||
      dragStateRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    if (Math.abs(deltaX) > 6) {
      dragStateRef.current.moved = true;
    }

    commitIndex(
      dragStateRef.current.startTarget - deltaX * DRAG_SENSITIVITY,
      false
    );
    event.stopPropagation();
  };

  const finishDrag = (event, index) => {
    if (
      dragStateRef.current.active &&
      dragStateRef.current.pointerId !== null &&
      event &&
      dragStateRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const didMove = dragStateRef.current.moved;
    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
    dragStateRef.current.moved = false;

    event?.target.releasePointerCapture?.(event.pointerId);

    if (didMove) {
      commitIndex(displayIndexRef.current, true);
      return;
    }

    if (typeof index === "number" && index !== activeIndex) {
      commitIndex(index, true);
      return;
    }

    if (panels[activeIndex]?.key === "map") {
      onRequestMapOpen?.();
    }
  };

  const activePanel = panels[activeIndex];

  return (
    <group>
      <mesh
        position={[0, 0, -4.2]}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={(event) => finishDrag(event)}
        onPointerCancel={(event) => finishDrag(event)}
        onLostPointerCapture={(event) => finishDrag(event)}
      >
        <planeGeometry args={[24, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {panels.map((panel, index) => {
        const isFocused = index === activeIndex;
        const relativeIndex = index - activeIndex;
        const showHint = Math.abs(relativeIndex) <= 2;

        return (
          <group
            key={panel.key}
            ref={(node) => {
              panelRefs.current[index] = node;
            }}
            visible={isFocused || showHint}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={(event) => finishDrag(event, index)}
            onPointerCancel={(event) => finishDrag(event, index)}
            onLostPointerCapture={(event) => finishDrag(event, index)}
          >
            <Panel3D
              title={panel.title ?? panel.sliderLabel}
              isActive={isFocused}
              presentation={isFocused ? "sliderFocus" : "sliderHint"}
              contentVisible={isFocused}
            >
              {panel.content}
            </Panel3D>
          </group>
        );
      })}

      {activePanel ? (
        <group position={[0, -1.95, 0.2]}>
          <mesh>
            <planeGeometry args={[3.1, 0.32]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.16} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}
