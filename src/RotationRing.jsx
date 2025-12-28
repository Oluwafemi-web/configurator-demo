import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * RotationRing component - displays a rotation control ring around a selected module
 * Allows users to rotate modules in 2D view mode
 */
export default function RotationRing({ position, angle, onRotate, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const ringRef = useRef();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    // Calculate angle from center to pointer
    const center = new THREE.Vector3(position[0], position[1], position[2]);
    const intersection = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    if (e.ray.intersectPlane(plane, intersection)) {
      const dx = intersection.x - center.x;
      const dz = intersection.z - center.z;
      const angleRad = Math.atan2(dz, dx);
      const angleDeg = (angleRad * 180) / Math.PI;
      onRotate(angleDeg);
    }
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <group position={position}>
      {/* Rotation ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        <ringGeometry args={[0.8, 0.9, 64]} />
        <meshBasicMaterial
          color="#1b1b1b"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotation indicator */}
      <mesh
        position={[
          Math.cos((angle * Math.PI) / 180) * 0.85,
          0.01,
          Math.sin((angle * Math.PI) / 180) * 0.85,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#1b1b1b" />
      </mesh>

      {/* Close button */}
      <Html position={[0, 0.5, 0]} center>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #1b1b1b",
            background: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          Done
        </button>
      </Html>

      {/* Angle display */}
      <Html position={[0, -0.5, 0]} center>
        <div
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: "500",
            pointerEvents: "none",
          }}
        >
          {Math.round(angle)}°
        </div>
      </Html>
    </group>
  );
}
