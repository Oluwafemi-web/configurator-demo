import { getModuleDimensions } from "./moduleDimensions";

const SNAP_DISTANCE = 0.6; // Increased threshold for "magnetic" feel

/**
 * Resolves custom or auto-calculated position for a chair
 * @param {Object} chair - Chair object
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {number[]} - Position array [x, y, z]
 */
export const getResolvedPosition = (chair, autoPositions) => {
  return chair.customPosition ?? autoPositions.get(chair.id) ?? [0, 0, 0];
};

/**
 * Helper: Get world dimensions (width, depth) of a module in meters, accounting for rotation
 */
const getWorldDimensions = (chair) => {
  const dims = getModuleDimensions(chair.sofa.id);
  // Dimensions in file are cm, convert to m
  const w = dims.width / 100;
  const d = dims.depth / 100;

  const rot = chair.rotation || 0;
  // Check if rotation is approx 90 or 270 degrees
  // Normalize to 0-PI range for checking perpendicularity is enough? 
  // actually sin(90)=1, sin(270)=-1. abs(sin) > 0.9 means perpendicular.
  const isRotated = Math.abs(Math.sin(rot)) > 0.9;

  return {
    width: isRotated ? d : w,
    depth: isRotated ? w : d,
    originalWidth: w,
    originalDepth: d
  };
};

/**
 * Finds snap target for dragging modules
 * Checks all 4 sides (Left, Right, Front, Back) of nearby modules
 */
export const findSnapTarget = (draggedChair, pos, chairs, autoPositions) => {
  let bestSnap = null;
  let minDistance = SNAP_DISTANCE;

  const draggedDims = getWorldDimensions(draggedChair);

  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;

    const neighborPos = getResolvedPosition(otherChair, autoPositions); // [x, y, z]
    const neighborDims = getWorldDimensions(otherChair);

    // Calculate snap centers for 4 sides
    const candidates = [
        // RIGHT
        {
            x: neighborPos[0] + (neighborDims.width / 2 + draggedDims.width / 2),
            z: neighborPos[2],
            side: 'right'
        },
        // LEFT
        {
            x: neighborPos[0] - (neighborDims.width / 2 + draggedDims.width / 2),
            z: neighborPos[2],
            side: 'left'
        },
        // TOP (Back) - Assuming -Z is "up" in 2D or just considering Z axis
        {
            x: neighborPos[0],
            z: neighborPos[2] - (neighborDims.depth / 2 + draggedDims.depth / 2),
            side: 'top'
        },
        // BOTTOM (Front)
        {
            x: neighborPos[0],
            z: neighborPos[2] + (neighborDims.depth / 2 + draggedDims.depth / 2),
            side: 'bottom'
        }
    ];

    candidates.forEach(cand => {
        const dx = cand.x - pos.x;
        const dz = cand.z - pos.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < minDistance) {
            minDistance = dist;
            bestSnap = {
                neighborId: otherChair.id,
                neighborPosition: neighborPos,
                snappedPosition: [cand.x, 0, cand.z],
                draggedDims: draggedDims, // Pass full dims for preview
                side: cand.side
            };
        }
    });
  });

  return bestSnap;
};
