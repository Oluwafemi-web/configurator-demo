import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

/**
 * FloorPlane component - renders the fixed FLOOR model
 * This model stays at y=0 and receives shadows from all sofa modules
 */
export default function FloorPlane() {
  const { scene } = useGLTF("/models/JUMP_SOFA/3D_MODELS/FLOOR.gltf");
  const floorRef = useRef();

  return (
    <primitive
      ref={floorRef}
      object={scene.clone()}
      position={[0, 0, 0]}
      receiveShadow
    />
  );
}

// Preload the FLOOR model for better performance
useGLTF.preload("/models/JUMP_SOFA/3D_MODELS/FLOOR.gltf");
