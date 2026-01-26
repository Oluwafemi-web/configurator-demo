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
    // Helper to check if a side is the "back" of the chair in local space
    // and if that chair has a backrest.
    const isBlockedSide = (side) => {
        if (!otherChair.sofa.hasBackrest) return false;

        // Map world side to local vector
        // World UP/Back (-Z) -> [0, -1] (2D logic Z is Y) -> wait, here Z is Z.
        // candidates define 'top' as z - depth/2. So 'top' is World -Z.
        // 'bottom' is World +Z.
        // 'right' is World +X.
        // 'left' is World -X.
        
        let worldDir = [0, 0];
        if (side === 'top') worldDir = [0, -1];
        if (side === 'bottom') worldDir = [0, 1];
        if (side === 'right') worldDir = [1, 0];
        if (side === 'left') worldDir = [-1, 0];

        // Rotate world vector by -rotation to get local vector
        const rot = otherChair.rotation || 0;
        const cos = Math.cos(-rot);
        const sin = Math.sin(-rot);
        
        const localX = worldDir[0] * cos - worldDir[1] * sin;
        const localZ = worldDir[0] * sin + worldDir[1] * cos;

        // Local Back is usually -Z (0, -1). 
        // We check if local vector is approx (0, -1)
        // EPSILON 0.1
        const isBack = Math.abs(localX) < 0.1 && localZ < -0.9;
        
        return isBack;
    };

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
        // TOP (Back) 
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
    ].filter(cand => !isBlockedSide(cand.side));

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
                neighborDims: neighborDims, // Pass neighbor dims for line calculation
                side: cand.side
            };
        }
    });
  });

  return bestSnap;
};
