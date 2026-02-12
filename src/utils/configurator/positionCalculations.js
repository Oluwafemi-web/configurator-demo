import { getModuleWidth } from "./getModuleWidth";
import { MODULE_DIMENSIONS } from "./moduleDimensions";

export const SNAP_DISTANCE = 1.5; // Snap distance - matches SnapZone visual radius
export const DETACH_DISTANCE = 2.5; // Distance to trigger detach (larger to match stronger snap)

/**
 * Check if a module is a pouf (doesn't snap to other modules)
 */
export const isPouf = (chair) => {
  const id = chair?.sofa?.id || "";
  return id.includes("pouf");
};

/**
 * Get actual module width in meters from moduleDimensions
 * Falls back to getModuleWidth if not found
 */
export const getActualModuleWidth = (chair) => {
  const id = chair?.sofa?.id;
  if (id && MODULE_DIMENSIONS[id]) {
    return MODULE_DIMENSIONS[id].width / 100;
  }
  return getModuleWidth(chair);
};

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
 * Gets all chairs in the same group as the given chair
 * @param {Object} chair - Chair to check
 * @param {Array} chairs - All chairs
 * @returns {Array} - Array of chairs in the same group
 */
export const getGroupMembers = (chair, chairs) => {
  if (!chair.groupId) return [chair];
  return chairs.filter((c) => c.groupId === chair.groupId);
};

/**
 * Creates a new group ID
 */
export const createGroupId = () => {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Finds attachable neighbors for a chair
 * @param {Object} draggedChair - The chair being dragged
 * @param {Object} pos - Current position {x, z}
 * @param {Array} chairs - Array of all chairs
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {Array} - Array of attachable neighbors with info
 */
export const findAttachableNeighbors = (draggedChair, pos, chairs, autoPositions) => {
  const attachable = [];
  
  // Poufs don't snap to anything
  if (isPouf(draggedChair)) return attachable;
  
  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;
    
    // Don't snap to poufs
    if (isPouf(otherChair)) return;
    
    // Don't attach if already in same group
    if (draggedChair.groupId && otherChair.groupId === draggedChair.groupId) return;
    
    const chairPos = getResolvedPosition(otherChair, autoPositions);
    const dx = chairPos[0] - pos.x;
    const dz = chairPos[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < SNAP_DISTANCE) {
      const direction = pos.x < chairPos[0] ? -1 : 1;
      const neighborWidth = getActualModuleWidth(otherChair);
      const draggedWidth = getActualModuleWidth(draggedChair);
      
      // Edge-to-edge: distance between centers = half of each width
      const spacing = (neighborWidth / 2) + (draggedWidth / 2);
      
      attachable.push({
        chair: otherChair,
        distance: dist,
        snappedPosition: [
          chairPos[0] + direction * spacing,
          0,
          chairPos[2],
        ],
        attachToGroup: otherChair.groupId || null,
      });
    }
  });
  
  return attachable;
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
  // Poufs don't snap to anything
  if (isPouf(draggedChair)) return null;
  
  let nearest = null;
  let nearestDist = Infinity;
  
  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;
    
    // Don't snap to poufs
    if (isPouf(otherChair)) return;
    
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
  const neighborWidth = getActualModuleWidth(nearest);
  const draggedWidth = getActualModuleWidth(draggedChair);
  
  // Edge-to-edge: distance between centers = half of each width
  const spacing = (neighborWidth / 2) + (draggedWidth / 2);
  
  return {
    neighborId: nearest.id,
    neighborPosition: neighborPos,
    snappedPosition: [
      neighborPos[0] + direction * spacing,
      0,
      neighborPos[2],
    ],
    draggedWidth,
    neighborGroupId: nearest.groupId,
  };
};

/**
 * Check if a chair should be detached from its group
 * @param {Object} chair - Chair to check
 * @param {Object} pos - Current position {x, z}
 * @param {Array} chairs - Array of all chairs
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {boolean} - True if should detach
 */
export const shouldDetach = (chair, pos, chairs, autoPositions) => {
  if (!chair.groupId) return false;
  
  const groupMembers = chairs.filter((c) => c.groupId === chair.groupId && c.id !== chair.id);
  
  for (const member of groupMembers) {
    // Use getResolvedPosition to handle both autoPositions and customPositions
    const memberPos = getResolvedPosition(member, autoPositions);
    const dx = memberPos[0] - pos.x;
    const dz = memberPos[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    // Only detach if far enough from ALL group members
    if (dist < DETACH_DISTANCE) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get the group center position (average of all member positions)
 * @param {Array} groupMembers - Array of chairs in the group
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {number[]} - Center position [x, y, z]
 */
export const getGroupCenter = (groupMembers, autoPositions) => {
  if (groupMembers.length === 0) return [0, 0, 0];
  
  let totalX = 0;
  let totalZ = 0;
  
  groupMembers.forEach((chair) => {
    const pos = getResolvedPosition(chair, autoPositions);
    totalX += pos[0];
    totalZ += pos[2];
  });
  
  return [totalX / groupMembers.length, 0, totalZ / groupMembers.length];
};

/**
 * Recalculate positions for all group members when one is moved
 * @param {Object} draggedChair - The chair being dragged
 * @param {Object} newPos - New position {x, y, z}
 * @param {Array} chairs - Array of all chairs
 * @param {Map} autoPositions - Map of auto-calculated positions
 * @returns {Map} - New positions map for all affected chairs
 */
export const recalculateGroupPositions = (draggedChair, newPos, chairs, autoPositions) => {
  const newPositions = new Map(autoPositions);
  
  if (!draggedChair.groupId) {
    // Not in a group, just update this chair
    newPositions.set(draggedChair.id, [newPos.x, newPos.y, newPos.z]);
    return newPositions;
  }
  
  // Get all group members
  const groupMembers = chairs.filter((c) => c.groupId === draggedChair.groupId);
  
  if (groupMembers.length <= 1) {
    newPositions.set(draggedChair.id, [newPos.x, newPos.y, newPos.z]);
    return newPositions;
  }
  
  // Calculate offset from dragged chair to group center
  const draggedPos = getResolvedPosition(draggedChair, autoPositions);
  const currentCenter = getGroupCenter(groupMembers, autoPositions);
  
  const offsetX = newPos.x - draggedPos[0];
  const offsetZ = newPos.z - draggedPos[2];
  
  // Move all group members by the same offset
  groupMembers.forEach((member) => {
    if (member.id === draggedChair.id) {
      newPositions.set(member.id, [newPos.x, newPos.y, newPos.z]);
    } else {
      const memberPos = getResolvedPosition(member, autoPositions);
      newPositions.set(member.id, [
        memberPos[0] + offsetX,
        memberPos[1],
        memberPos[2] + offsetZ,
      ]);
    }
  });
  
  return newPositions;
};
