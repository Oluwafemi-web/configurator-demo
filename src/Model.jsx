import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
const useOptionalTexture = (path) => {
  return useMemo(() => {
    if (!path) return null;
    const loader = new THREE.TextureLoader();
    const texture = loader.load(path);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, [path]);
};

export default function Model({
  modelPath,
  chairTexturePath,
  pillowTexturePath,
  feetTexturePath,
  position = [0, 0, 0],
  onDimensionsDetected,
  dimensionsPayload,
}) {
  const safePath = modelPath || "/models/Jump_Sofa_GLB/Jump_Sofa_CENTER.glb";
  const { scene } = useGLTF(safePath);
  const clonedScene = useMemo(() => {
    // Clone to avoid mutating cached GLTF scene
    return scene.clone(true);
  }, [scene]);

  const chairTexture = useOptionalTexture(chairTexturePath);
  const pillowTexture = useOptionalTexture(pillowTexturePath);
  const feetTexture = useOptionalTexture(feetTexturePath);

  useEffect(() => {
    if (!clonedScene) return;

    // Apply textures to meshes based on their parent node names
    // Node naming convention: seat_centro01, back_centro01, pillow_centro01, feet_centro01, base
    // Only apply textures if they are set

    // Find nodes by pattern matching
    // Handles: seat_centro01, seatDX_01, seatSX_02, backSX_01, backDX_01,
    //          feet_SX01, feet_DX01, armrestSX_01, armrestDX_01, base
    const findNodesByPattern = (patterns) => {
      const found = [];
      clonedScene.traverse((child) => {
        if (child.name) {
          const nameLower = child.name.toLowerCase();
          for (const pattern of patterns) {
            const patternLower = pattern.toLowerCase();

            // Check for exact match (e.g., "base")
            if (nameLower === patternLower) {
              found.push(child);
              break;
            }

            // Check if starts with pattern
            if (nameLower.startsWith(patternLower)) {
              const remaining = nameLower.slice(patternLower.length);

              // Empty remaining = exact match (already handled above)
              if (remaining === "") {
                continue;
              }

              // Pattern followed by underscore (e.g., seat_centro01, feet_SX01, feet_DX01)
              if (remaining.startsWith("_")) {
                found.push(child);
                break;
              }

              // Pattern followed by letters then underscore (e.g., seatDX_01, seatSX_02, backSX_01, armrestDX_01)
              // This matches: pattern + [dx|sx|centro|etc] + _ + numbers
              // Matches 1-10 lowercase letters followed by underscore
              if (remaining.match(/^[a-z]{1,10}_/)) {
                found.push(child);
                break;
              }

              // Pattern followed by letters (e.g., seatdx, backsx, armrestdx)
              // This handles cases where there might be numbers after without underscore
              // Matches 1-10 lowercase letters (optionally followed by numbers)
              if (remaining.match(/^[a-z]{1,10}/)) {
                found.push(child);
                break;
              }
            }

            // Check if contains pattern with underscores around it
            if (
              nameLower.includes("_" + patternLower + "_") ||
              nameLower.endsWith("_" + patternLower)
            ) {
              found.push(child);
              break;
            }
          }
        }
      });
      return found;
    };

    // Apply texture to all meshes under matching nodes (only if provided)
    const applyTextureToNodes = (patterns, texture, metalness, roughness) => {
      if (!texture) return; // Don't apply if null

      const nodes = findNodesByPattern(patterns);
      nodes.forEach((node) => {
        node.traverse((child) => {
          if (child.isMesh) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((mat) => {
              if (mat) {
                mat.map = texture;
                mat.color.set("#ffffff");
                mat.metalness = metalness;
                mat.roughness = roughness;
                mat.needsUpdate = true;
              }
            });
          }
        });
      });
    };

    // Apply textures using pattern matching
    // Pillow: pillow_centro01, pillow_dx, pillow_sx, cushion_centro01, etc.
    applyTextureToNodes(["pillow", "cushion"], pillowTexture, 0, 0.9);

    // Feet: feet_centro01, feet_dx, feet_sx, leg, legs
    applyTextureToNodes(["feet", "leg"], feetTexture, 0.8, 0.2);

    // Chair parts: seat_centro01, seatDX_01, back_centro01, backDX_01, armrestDX_01, base
    applyTextureToNodes(
      ["seat", "back", "base", "armrest"],
      chairTexture,
      0,
      0.9
    );
  }, [clonedScene, chairTexture, pillowTexture, feetTexture]);

  useEffect(() => {
    if (!clonedScene || !onDimensionsDetected) return;
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    clonedScene.updateMatrixWorld(true);
    box.setFromObject(clonedScene);
    box.getSize(size);
    if (Number.isFinite(size.x)) {
      onDimensionsDetected(dimensionsPayload, {
        width: size.x,
        height: size.y,
        depth: size.z,
      });
    }
  }, [clonedScene, onDimensionsDetected, dimensionsPayload]);

  return <primitive object={clonedScene} scale={1} position={position} />;
}

useGLTF.preload("/models/Jump_Sofa_GLB/Jump_Sofa_CENTER.glb");
useGLTF.preload("/models/Jump_Sofa_GLB/Jump_Sofa_DX.glb");
useGLTF.preload("/models/Jump_Sofa_GLB/Jump_Sofa_SX.glb");
