import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  PerspectiveCamera,
  ContactShadows,
  CameraControls,
} from "@react-three/drei";
import { useRef, useEffect } from "react";
import Model from "../../Model";
import DimensionLines from "../DimensionLines";
import { MODULE_DIMENSIONS } from "../../utils/configurator/moduleDimensions";

export default function Canvas3DView({
  chairs,
  selectedChairTexture,
  selectedPillowTexture,
  selectedFeetTexture,
  getResolvedPosition,
  showDimensions,
  zoom = 100,
  focusedChairId,
}) {
  const controlsRef = useRef(null);

  // Calculate FOV based on zoom percentage
  // 100% zoom = 35 FOV, 200% zoom = 17.5 FOV, 50% zoom = 70 FOV
  const fov = 35 / (zoom / 100);

  return (
    <Canvas gl={{ preserveDrawingBuffer: true }}>
      <PerspectiveCamera makeDefault position={[2, 3, 6]} fov={fov} />

      <ambientLight intensity={2} />
      <directionalLight position={[3, 3, 3]} intensity={1} />

      {chairs.map((chair) => {
        const resolvedPosition = getResolvedPosition(chair);

        // Get module dimensions for origin offset
        const moduleId = chair.sofa.id;
        const dims = MODULE_DIMENSIONS[moduleId] || { width: 99, depth: 99, originX: 0, originZ: 0 };
        const width = dims.width / 100;
        const depth = dims.depth / 100;
        const originX = dims.originX || 0;
        const originZ = dims.originZ || 0;

        return (
          <group key={chair.id} position={resolvedPosition} rotation={[0, chair.rotation || 0, 0]}>
            <Model
              modelPath={chair.sofa.modelPath}
              chairTexturePath={chair.chairTexture || selectedChairTexture}
              pillowTexturePath={chair.pillowTexture || selectedPillowTexture}
              feetTexturePath={chair.feetTexture || selectedFeetTexture}
              width={width}
              depth={depth}
              originX={originX}
              originZ={originZ}
            //isFocused={chair.id === focusedChairId}
            />
          </group>
        );
      })}

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={15}
        blur={2.5}
        far={4}
        resolution={512}
        color="#1a1a1a"
      />

      <CameraControls
        ref={controlsRef}
        minDistance={2}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        makeDefault
      />

      {/* Dimension Lines - Shows measurements when enabled */}
      {showDimensions && chairs.length > 0 && (
        <DimensionLines chairs={chairs} getResolvedPosition={getResolvedPosition} viewMode="3d" />
      )}
    </Canvas>
  );
}
