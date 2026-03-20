import { Interactive } from "@react-three/xr";
import { forwardRef, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DRAG_PLANE_NORMAL = new THREE.Vector3(0, 0, 1);

const MovablePanelGroup = forwardRef(function MovablePanelGroup(
  {
    panelKey,
    defaultPosition,
    moveModeActive = false,
    movable = true,
    onTogglePanel,
    onDragStateChange,
    children,
  },
  ref
) {
  const groupRef = useRef(null);
  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const dragPointRef = useRef(new THREE.Vector3());
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const [position, setPosition] = useState(() => [...defaultPosition]);
  const displayedPosition = moveModeActive ? position : defaultPosition;

  const setGroupRef = (node) => {
    groupRef.current = node;

    if (typeof ref === "function") {
      ref(node);
      return;
    }

    if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(
      DRAG_PLANE_NORMAL,
      new THREE.Vector3(0, 0, defaultPosition[2])
    );
  }, [defaultPosition]);

  useEffect(() => {
    if (moveModeActive) {
      return;
    }

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    onDragStateChange?.(false);
  }, [moveModeActive, onDragStateChange]);

  const finishDrag = (event) => {
    if (!isDraggingRef.current) {
      return;
    }

    if (
      event &&
      activePointerIdRef.current !== null &&
      event.pointerId !== activePointerIdRef.current
    ) {
      return;
    }

    event?.stopPropagation();
    event?.target.releasePointerCapture?.(event.pointerId);

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    onDragStateChange?.(false);
  };

  const handlePointerDown = (event) => {
    if (!moveModeActive || !movable || !groupRef.current) {
      return;
    }

    if (!event.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current)) {
      return;
    }

    event.stopPropagation();
    event.target.setPointerCapture?.(event.pointerId);

    activePointerIdRef.current = event.pointerId;
    isDraggingRef.current = true;
    dragOffsetRef.current.set(
      groupRef.current.position.x - dragPointRef.current.x,
      groupRef.current.position.y - dragPointRef.current.y,
      0
    );
    onDragStateChange?.(true);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || event.pointerId !== activePointerIdRef.current) {
      return;
    }

    if (!event.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current)) {
      return;
    }

    event.stopPropagation();
    setPosition([
      dragPointRef.current.x + dragOffsetRef.current.x,
      dragPointRef.current.y + dragOffsetRef.current.y,
      defaultPosition[2],
    ]);
  };

  const handleSelect = () => {
    if (!moveModeActive) {
      onTogglePanel?.(panelKey);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();

    if (!moveModeActive) {
      onTogglePanel?.(panelKey);
    }
  };

  return (
    <Interactive onSelect={handleSelect}>
      <group
        ref={setGroupRef}
        position={displayedPosition}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
      >
        {children}
      </group>
    </Interactive>
  );
});

export default MovablePanelGroup;
