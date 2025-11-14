import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
export default function Model({ textureURL }) {
  const { scene } = useGLTF("/models/TEST.glb");

  // Load selected texture
  const texture = useTexture(textureURL);

  useEffect(() => {
    if (!texture) return;
    const tex = texture;
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      if (child.isMesh) {
        const mat = child.material;

        mat.map = tex;
        mat.needsUpdate = true;

        // IMPORTANT FIXES ⬇️
        mat.color.set("#ffffff"); // remove tint
        mat.metalness = 0; // fabric should not shine
        mat.roughness = 0.9; // soft fabric reflectivity
        mat.metalnessMap = null;

        // Optional… If texture looks too large or small:
        tex.repeat.set(2, 2);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      }
    });
  }, [texture]);

  return <primitive object={scene} scale={1} />;
}
