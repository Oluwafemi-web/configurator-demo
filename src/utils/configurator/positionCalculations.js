import { getModuleWidth } from "./getModuleWidth";

const SNAP_DISTANCE = 0.4;

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
 * Finds snap target for dragging modules
 * @param {Object} draggedChair - The chair being dragged
 * @param {Object} pos - Current position {x, z}
 * @param {Array} chairs - Array of all chairs
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {Object|null} - Snap target info or null
 */
export const findSnapTarget = (draggedChair, pos, chairs, autoPositions) => {
  let nearest = null;
  let nearestDist = Infinity;
  
  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;
    const chairPos = getResolvedPosition(otherChair, autoPositions);
    const dx = chairPos[0] - pos.x;
    const dz = chairPos[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = otherChair;
    }
  });
  
  if (!nearest || nearestDist >= SNAP_DISTANCE) return null;
  
  const neighborPos = getResolvedPosition(nearest, autoPositions);
  const direction = pos.x < neighborPos[0] ? -1 : 1;
  const neighborWidth = getModuleWidth(nearest);
  const draggedWidth = getModuleWidth(draggedChair);
  const spacing = (neighborWidth + draggedWidth) / 2;
  
  return {
    neighborId: nearest.id,
    neighborPosition: neighborPos,
    snappedPosition: [
      neighborPos[0] + direction * spacing,
      0,
      neighborPos[2],
    ],
    draggedWidth,
  };
};
