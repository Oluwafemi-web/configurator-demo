import { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Raycaster, Vector3, Plane } from "three";

export default function DraggableModule({
  children,
  position,
  onDragStart,
  onDrag,
  onDragEnd,
  onSelect,
  onDoubleClick,
  disabled = false,
  viewMode = "2d",
  isSnapReady = false,
  selected = false,
  moduleWidth = 1.14,
  moduleDepth = 1,
}) {
  const groupRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef(new Vector3());
  const raycasterRef = useRef(new Raycaster());
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0)); // XZ plane at y=0
  const { camera, gl } = useThree();
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const initialPointerPosRef = useRef({ x: 0, y: 0 });
  const lastClickTimeRef = useRef(0);
  const DOUBLE_CLICK_DELAY = 300; // ms

  // Sync position when prop changes or when switching modes
  useEffect(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position, isDragging, viewMode]);

  const handlePointerMove = useCallback(
    (event) => {
      if (
        !isPointerDownRef.current ||
        viewMode !== "2d" ||
        disabled ||
        !groupRef.current
      )
        return;

      // Check if pointer has moved (to distinguish click from drag)
      const moveThreshold = 5; // pixels
      const deltaX = Math.abs(event.clientX - initialPointerPosRef.current.x);
      const deltaY = Math.abs(event.clientY - initialPointerPosRef.current.y);

      if (
        !hasMovedRef.current &&
        (deltaX > moveThreshold || deltaY > moveThreshold)
      ) {
        hasMovedRef.current = true;
        setIsDragging(true);

        // Only call onDragStart when we actually start dragging
        if (onDragStart && groupRef.current) {
          onDragStart({
            x: groupRef.current.position.x,
            y: groupRef.current.position.y,
            z: groupRef.current.position.z,
          });
        }
      }

      // Only update position if we're actually dragging
      if (!hasMovedRef.current) return;

      const pointer = gl.domElement.getBoundingClientRect();
      const mouse = new Vector3();
      mouse.x = ((event.clientX - pointer.left) / pointer.width) * 2 - 1;
      mouse.y = -((event.clientY - pointer.top) / pointer.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouse, camera);
      const intersectPoint = new Vector3();
      raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint);

      if (intersectPoint) {
        const newPos = intersectPoint.clone().add(dragOffsetRef.current);
        newPos.y = 0; // Always lock Y to 0
        groupRef.current.position.copy(newPos);

        if (onDrag) {
          onDrag({
            x: newPos.x,
            y: 0,
            z: newPos.z,
          });
        }
      }
    },
    [viewMode, disabled, camera, gl, onDrag, onDragStart]
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (!isPointerDownRef.current) return;

      const wasDragging = hasMovedRef.current;

      // Reset drag state
      isPointerDownRef.current = false;
      setIsPointerDown(false);
      hasMovedRef.current = false;
      setIsDragging(false);

      // Only call onDragEnd if we were actually dragging
      if (wasDragging && onDragEnd && groupRef.current) {
        event?.stopPropagation();
        onDragEnd({
          x: groupRef.current.position.x,
          y: groupRef.current.position.y,
          z: groupRef.current.position.z,
        });
      }
    },
    [onDragEnd]
  );

  const handlePointerDown = (event) => {
    if (disabled || viewMode !== "2d") return;
    event.stopPropagation();

    // Track pointer down state and initial position
    isPointerDownRef.current = true;
    setIsPointerDown(true);
    hasMovedRef.current = false;
    initialPointerPosRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    // Calculate the offset between the mouse position and the object position
    const pointer = gl.domElement.getBoundingClientRect();
    const mouse = new Vector3();
    mouse.x = ((event.clientX - pointer.left) / pointer.width) * 2 - 1;
    mouse.y = -((event.clientY - pointer.top) / pointer.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouse, camera);
    const intersectPoint = new Vector3();
    raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint);

    if (intersectPoint && groupRef.current) {
      const currentPos = new Vector3().copy(groupRef.current.position);
      dragOffsetRef.current.subVectors(currentPos, intersectPoint);
    }
  };

  // Global mouse move and up handlers for dragging
  // Use a state to track pointer down so useEffect can react to changes
  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    if (isPointerDown && viewMode === "2d") {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      return () => {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("mouseup", handlePointerUp);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isPointerDown, viewMode, handlePointerMove, handlePointerUp]);

  const handleClick = (event) => {
    // Only handle click if we're not dragging (i.e., it was just a click, not a drag)
    if (hasMovedRef.current) return;
    
    // Check for double-click (works even when disabled)
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTimeRef.current;
    lastClickTimeRef.current = currentTime;
    
    if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
      // Double click detected
      if (onDoubleClick) {
        onDoubleClick(event);
      }
      return;
    }
    
    // Regular click - only works when not disabled
    if (disabled) return;
    
    event.stopPropagation();
    
    // Pass click info to parent - parent decides whether to show menu
    if (onSelect) {
      onSelect(event, true); // true = this is the first click (show highlight only)
    }
  };

  // Selection highlight - black outline only
  const SelectionHighlight = () => {
    if (!selected) return null;
    return (
      <group position={[0, 0.015, 0]}>
        {/* Black outline */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(moduleWidth, 0.01, moduleDepth)]} />
          <lineBasicMaterial color="#000000" />
        </lineSegments>
      </group>
    );
  };

  // In 2D mode, use custom drag implementation with raycasting
  if (viewMode === "2d") {
    return (
      <group
        ref={groupRef}
        position={position}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {children}
        <SelectionHighlight />
      </group>
    );
  }

  // 3D mode: no drag controls
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {children}
      <SelectionHighlight />
    </group>
  );
}
