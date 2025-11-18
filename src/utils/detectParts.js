import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Detects available parts in a GLB model by analyzing node names
 * @param {string} modelPath - Path to the GLB file
 * @returns {Promise<string[]>} Array of detected parts: ["chair", "pillow", "feet"]
 */
export async function detectPartsFromModel(modelPath) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        const scene = gltf.scene;
        const detectedParts = [];
        const nodeNames = new Set();

        // Traverse the scene to collect all node names
        scene.traverse((child) => {
          console.log(child.name);
          if (child.name) {
            nodeNames.add(child.name.toLowerCase());
          }
        });

        // Helper to check if any node name matches a pattern
        // Handles: seat_centro01, seatDX_01, seatSX_02, backSX_01, backDX_01,
        //          feet_SX01, feet_DX01, armrestSX_01, armrestDX_01, base
        const hasNodeMatchingPattern = (patterns) => {
          for (const nodeName of nodeNames) {
            for (const pattern of patterns) {
              const patternLower = pattern.toLowerCase();

              // Check for exact match (e.g., "base")
              if (nodeName === patternLower) {
                return true;
              }

              // Check if starts with pattern
              if (nodeName.startsWith(patternLower)) {
                const remaining = nodeName.slice(patternLower.length);

                // Empty remaining = exact match (already handled above)
                if (remaining === "") {
                  continue;
                }

                // Pattern followed by underscore (e.g., seat_centro01, feet_SX01, feet_DX01)
                if (remaining.startsWith("_")) {
                  return true;
                }

                // Pattern followed by letters then underscore (e.g., seatDX_01, seatSX_02, backSX_01, armrestDX_01)
                // This matches: pattern + [dx|sx|centro|etc] + _ + numbers
                // Matches 1-10 lowercase letters followed by underscore
                if (remaining.match(/^[a-z]{1,10}_/)) {
                  return true;
                }

                // Pattern followed by letters (e.g., seatdx, backsx, armrestdx)
                // This handles cases where there might be numbers after without underscore
                // Matches 1-10 lowercase letters (optionally followed by numbers)
                if (remaining.match(/^[a-z]{1,10}/)) {
                  return true;
                }
              }

              // Check if contains pattern with underscores around it
              if (
                nodeName.includes("_" + patternLower + "_") ||
                nodeName.endsWith("_" + patternLower)
              ) {
                return true;
              }
            }
          }
          return false;
        };

        // Map node names to parts using pattern matching
        // Chair parts: seat_centro01, seatDX_01, seat_dx, seat_sx, back_centro01, backDX_01, back_dx, armrestDX_01, base, etc.
        if (hasNodeMatchingPattern(["seat", "back", "base", "armrest"])) {
          detectedParts.push("chair");
        }

        // Pillow part: pillow_centro01, pillow_dx, pillow_sx, cushion_centro01, etc.
        if (hasNodeMatchingPattern(["pillow", "cushion"])) {
          detectedParts.push("pillow");
        }

        // Feet part: feet_centro01, feet_dx, feet_sx, leg, legs, etc.
        if (hasNodeMatchingPattern(["feet", "leg"])) {
          detectedParts.push("feet");
        }

        // Dispose of the loaded model to free memory
        scene.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });

        resolve(detectedParts);
      },
      undefined,
      (error) => {
        console.error("Error loading model for part detection:", error);
        // Return default parts on error
        resolve(["chair", "pillow", "feet"]);
      }
    );
  });
}
