import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect } from "react";

export default function Model({ textureURL }) {
  const { scene } = useGLTF("/models/TEST.glb");

  // Load selected texture
  const texture = useTexture(textureURL);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  }, [texture, scene]);

  return <primitive object={scene} scale={1} />;
}
