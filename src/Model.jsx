import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function Model({ chairColor, pillowColor, feetColor }) {
  const { scene } = useGLTF("/models/TEST_pieces_glb_separate.glb");

  useEffect(() => {
    // Apply colors to meshes based on their parent node names
    // Nodes: "seat", "base", "backrest" (chair parts), "feet", "pillow"
    // Only apply colors if they are set (not null)

    // Find nodes directly by name
    const findNodeByName = (name) => {
      let found = null;
      scene.traverse((child) => {
        if (child.name && child.name.toLowerCase() === name.toLowerCase()) {
          found = child;
        }
      });
      return found;
    };

    // Apply color to all meshes under a specific node (only if color is provided)
    const applyColorToNode = (nodeName, color, metalness, roughness) => {
      if (!color) return; // Don't apply if color is null/undefined

      const node = findNodeByName(nodeName);
      if (node) {
        node.traverse((child) => {
          if (child.isMesh) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((mat) => {
              if (mat) {
                mat.color.set(color);
                mat.metalness = metalness;
                mat.roughness = roughness;
                mat.needsUpdate = true;
              }
            });
          }
        });
      }
    };

    // Apply colors to specific nodes (only if colors are set)
    if (pillowColor) {
      applyColorToNode("pillow", pillowColor, 0, 0.9);
    }
    if (feetColor) {
      applyColorToNode("feet", feetColor, 0.8, 0.2);
    }
    if (chairColor) {
      applyColorToNode("seat", chairColor, 0, 0.9);
      applyColorToNode("backrest", chairColor, 0, 0.9);
      applyColorToNode("base", chairColor, 0, 0.9);
    }
  }, [chairColor, pillowColor, feetColor, scene]);

  return <primitive object={scene} scale={1} />;
}
