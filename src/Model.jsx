import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { getModuleDimensions } from "./utils/configurator/moduleDimensions";
const useOptionalTexture = (path) => {
  // useLoader from drei/r3f handles caching automatically
  // We need to handle the optional case - use a memoized loader
  const textureCache = useRef(new Map());

  return useMemo(() => {
    if (!path) return null;

    // Check cache first
    if (textureCache.current.has(path)) {
      return textureCache.current.get(path);
    }

    // Load texture using TextureLoader
    const loader = new THREE.TextureLoader();
    const texture = loader.load(path);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    // Cache it
    textureCache.current.set(path, texture);

    return texture;
  }, [path]);
};


export default function Model({
  modelPath,
  chairTexturePath,
  pillowTexturePath,
  feetTexturePath,
  width = 0.99,
  depth = 0.99,
  originX = 0,
  originZ = 0,
}) {
  const safePath = modelPath;
  const { scene } = useGLTF(safePath);

  // Create a stable cloned scene that persists across renders
  // Only recreate if the model path actually changes
  const clonedSceneRef = useRef(null);
  const scenePathRef = useRef(null);

  if (scenePathRef.current !== safePath || !clonedSceneRef.current) {
    clonedSceneRef.current = scene.clone(true);
    scenePathRef.current = safePath;
  }
  useEffect(() => {
    if (!scene) return;

    clonedSceneRef.current = scene.clone(true);
    scenePathRef.current = safePath;
  }, [scene, safePath]);

  const clonedScene = clonedSceneRef.current;


  // Use drei's useTexture for proper texture management and caching
  // This ensures textures are reused and properly updated
  const chairTexture = useOptionalTexture(chairTexturePath);
  const pillowTexture = useOptionalTexture(pillowTexturePath);
  const feetTexture = useOptionalTexture(feetTexturePath);

  // Store material references to update them without recreating meshes
  const materialRefsRef = useRef({
    chair: [],
    pillow: [],
    feet: [],
  });

  // Initialize material references once when scene is created
  useEffect(() => {
    if (!clonedScene) return;

    // Find nodes by pattern matching
    const findNodesByPattern = (patterns) => {
      const found = [];
      clonedScene.traverse((child) => {
        if (child.name) {
          const nameLower = child.name.toLowerCase();
          for (const pattern of patterns) {
            const patternLower = pattern.toLowerCase();

            if (nameLower === patternLower) {
              found.push(child);
              break;
            }

            if (nameLower.startsWith(patternLower)) {
              const remaining = nameLower.slice(patternLower.length);
              if (remaining === "") continue;
              if (remaining.startsWith("_")) {
                found.push(child);
                break;
              }
              if (remaining.match(/^[a-z]{1,10}_/)) {
                found.push(child);
                break;
              }
              if (remaining.match(/^[a-z]{1,10}/)) {
                found.push(child);
                break;
              }
            }

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

    // Collect material references for each category
    const collectMaterials = (patterns, category) => {
      const nodes = findNodesByPattern(patterns);
      const materials = [];
      nodes.forEach((node) => {
        node.traverse((child) => {
          if (child.isMesh) {
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];
            mats.forEach((mat) => {
              if (mat && !materials.includes(mat)) {
                materials.push(mat);
              }
            });
          }
        });
      });
      materialRefsRef.current[category] = materials;
    };

    collectMaterials(["pillow", "cushion"], "pillow");
    collectMaterials(["feet", "leg"], "feet");
    collectMaterials(["seat", "back", "base", "armrest"], "chair");
  }, [clonedScene]);

  // Update textures by mutating existing materials (no recreation)
  useEffect(() => {
    const { chair, pillow, feet } = materialRefsRef.current;

    // Update chair materials
    chair.forEach((mat) => {
      if (mat) {
        if (chairTexture) {
          // Dispose old texture if it exists
          if (mat.map && mat.map !== chairTexture) {
            mat.map.dispose();
          }
          mat.map = chairTexture;
          mat.map.flipY = false;
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
          mat.map.repeat.set(1, 1);
        }
        mat.color.set("#ffffff");
        mat.metalness = 0;
        mat.roughness = 0.9;
        mat.needsUpdate = true;
      }
    });

    // Update pillow materials
    pillow.forEach((mat) => {
      if (mat) {
        if (pillowTexture) {
          if (mat.map && mat.map !== pillowTexture) {
            mat.map.dispose();
          }
          mat.map = pillowTexture;
          mat.map.flipY = false;
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
          mat.map.repeat.set(1, 1);
        }
        mat.color.set("#ffffff");
        mat.metalness = 0;
        mat.roughness = 0.9;
        mat.needsUpdate = true;
      }
    });

    // Update feet materials
    feet.forEach((mat) => {
      if (mat) {
        if (feetTexture) {
          if (mat.map && mat.map !== feetTexture) {
            mat.map.dispose();
          }
          mat.map = feetTexture;
          mat.map.flipY = false;
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
          mat.map.repeat.set(1, 1);
        }
        mat.color.set("#ffffff");
        mat.metalness = 0.8;
        mat.roughness = 0.2;
        mat.needsUpdate = true;
      }
    });
  }, [chairTexture, pillowTexture, feetTexture]);

  const groupRef = useRef(null);

  // Calculate centering offset based on GLB model's origin point
  // originX/originZ tell us where the model's actual origin is located
  // relative to the corner of the module's bounding box
  const offsetX = (width / 2) - (originX || 0);
  const offsetZ = (depth / 2) - (originZ || 0);

  return (
    <group ref={groupRef} position={[offsetX, 0, offsetZ]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/Jump_Sofa_GLB/jump_Center.glb");
useGLTF.preload("/models/Jump_Sofa_GLB/jump_Left.glb");

