import * as THREE from "three";
import { getModuleDimensions } from "./moduleDimensions";

/**
 * Calculates the total dimensions and bounding box of the composition
 * @param {Array} chairs - Array of chair objects
 * @param {Function} getResolvedPosition - Function to get the resolved [x, y, z] position of a chair
 * @returns {Object|null} - { bbox, width, depth, height, center } or null if empty
 */
export const calculateCompositionDimensions = (chairs, getResolvedPosition) => {
    if (!chairs || chairs.length === 0) return null;

    const bbox = new THREE.Box3();

    // Expand bounding box to include all chairs with their actual dimensions
    chairs.forEach((chair) => {
        const pos = getResolvedPosition(chair);
        const moduleDims = getModuleDimensions(chair.sofa.id);

        // Convert cm to meters for Three.js
        const width = moduleDims.width / 100;
        const depth = moduleDims.depth / 100;
        const height = moduleDims.height / 100;

        // Expand bbox considering rotation
        const rotation = chair.rotation || 0;
        const cos = Math.abs(Math.cos(rotation));
        const sin = Math.abs(Math.sin(rotation));

        // Rotated dimensions
        const rotatedWidth = width * cos + depth * sin;
        const rotatedDepth = width * sin + depth * cos;

        bbox.expandByPoint(new THREE.Vector3(
            pos[0] - rotatedWidth / 2,
            0,
            pos[2] - rotatedDepth / 2
        ));
        bbox.expandByPoint(new THREE.Vector3(
            pos[0] + rotatedWidth / 2,
            height,
            pos[2] + rotatedDepth / 2
        ));
    });

    const width = bbox.max.x - bbox.min.x;
    const depth = bbox.max.z - bbox.min.z;
    const height = bbox.max.y - bbox.min.y;

    return {
        bbox,
        width,
        depth,
        height,
        center: new THREE.Vector3(
            (bbox.min.x + bbox.max.x) / 2,
            (bbox.min.y + bbox.max.y) / 2,
            (bbox.min.z + bbox.max.z) / 2
        ),
    };
};
