import React from "react";
import * as THREE from "three";

export default function SnapZone({ position, width, depth, isActive, isInRange, isSameGroup }) {
  if (!isActive || !isInRange || isSameGroup) return null;

  // Calculate the snap zone radius
  const snapRadius = 2.5;

  return (
    <group position={[position[0], 0.05, position[2]]}>
      {/* Pulsing blue ring effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[snapRadius, 64]} />
        <meshBasicMaterial
          color="#00BFFF"
          transparent
          opacity={0.2}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Blue outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[snapRadius - 0.15, snapRadius, 64]} />
        <meshBasicMaterial
          color="#00BFFF"
          transparent
          opacity={0.8}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
