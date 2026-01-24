import { Canvas } from "@react-three/fiber";
import {
  PerspectiveCamera,
  ContactShadows,
  Environment,
  CameraControls,
} from "@react-three/drei";
import { useRef, useEffect } from "react";
import Model from "../../Model";
import DimensionLines from "../DimensionLines";

export default function Canvas3DView({
  chairs,
  selectedChairTexture,
  selectedPillowTexture,
  selectedFeetTexture,
  getResolvedPosition,
  showDimensions,
}) {
  const controlsRef = useRef(null);

  return (
    <Canvas gl={{ preserveDrawingBuffer: true }}>
      <PerspectiveCamera makeDefault position={[10, 5, 10]} fov={35} />

      <ambientLight intensity={2} />
      <directionalLight position={[3, 3, 3]} intensity={1} />

      {chairs.map((chair) => {
        const resolvedPosition = getResolvedPosition(chair);

        return (
          <group key={chair.id} position={resolvedPosition} rotation={[0, chair.rotation || 0, 0]}>
            <Model
              modelPath={chair.sofa.modelPath}
              chairTexturePath={chair.chairTexture || selectedChairTexture}
              pillowTexturePath={chair.pillowTexture || selectedPillowTexture}
              feetTexturePath={chair.feetTexture || selectedFeetTexture}
              autoRotate={false} // or true if desired
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
        minDistance={3}
        maxDistance={50}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        makeDefault
      />

      {/* Dimension Lines - Shows measurements when enabled */}
      {showDimensions && chairs.length > 0 && (
        <DimensionLines chairs={chairs} getResolvedPosition={getResolvedPosition} viewMode="3d" />
      )}

      <Environment preset="night" />
    </Canvas>
  );
}
