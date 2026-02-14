import * as THREE from "three";
import { getModuleDimensions } from "./moduleDimensions";

/**
 * Calculates the total dimensions and bounding box of the composition
 * @param {Array} chairs - Array of chair objects
 * @param {Function} getResolvedPosition - Function to get the resolved [x, y, z] position of a chair
 * @returns {Object|null} - { bbox, width, depth, height, center } or null if empty
 */
const SNAP_DISTANCE = 1.6; // Slightly larger than snap distance to catch adjacencies

/**
 * Calculates dimensions for a specific group of chairs
 */
const calculateGroupDimensions = (groupChairs, getResolvedPosition) => {
    if (!groupChairs || groupChairs.length === 0) return null;

    const bbox = new THREE.Box3();

    // Expand bounding box to include all chairs in this group
    groupChairs.forEach((chair) => {
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
        id: groupChairs[0].id, // Use first chair ID as stable key
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

/**
 * Clusters chairs into connected groups based on proximity
 */
const groupChairsByProximity = (chairs, getResolvedPosition) => {
    const groups = [];
    const visited = new Set();

    chairs.forEach((chair) => {
        if (visited.has(chair.id)) return;

        const currentGroup = [];
        const queue = [chair];
        visited.add(chair.id);

        while (queue.length > 0) {
            const current = queue.shift();
            currentGroup.push(current);
            const currentPos = getResolvedPosition(current);

            // Find neighbors
            chairs.forEach((other) => {
                if (visited.has(other.id)) return;

                const otherPos = getResolvedPosition(other);
                const dx = currentPos[0] - otherPos[0];
                const dz = currentPos[2] - otherPos[2];
                const dist = Math.sqrt(dx * dx + dz * dz);

                // Use a slightly larger threshold than snap distance to ensure grouping works seamlessly
                if (dist < SNAP_DISTANCE) {
                    visited.add(other.id);
                    queue.push(other);
                }
            });
        }
        groups.push(currentGroup);
    });

    return groups;
};

/**
 * Calculates dimensions for ALL separated groups of furniture
 * @returns {Array} - Array of dimension objects { bbox, width, depth, height, center }
 */
export const calculateCompositionDimensions = (chairs, getResolvedPosition) => {
    if (!chairs || chairs.length === 0) return [];

    const groups = groupChairsByProximity(chairs, getResolvedPosition);
    return groups.map(group => calculateGroupDimensions(group, getResolvedPosition)).filter(Boolean);
};
