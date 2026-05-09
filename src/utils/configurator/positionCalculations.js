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
 * Get actual module depth in meters from moduleDimensions
 */
export const getActualModuleDepth = (chair) => {
  const id = chair?.sofa?.id;
  if (id && MODULE_DIMENSIONS[id]) {
    return MODULE_DIMENSIONS[id].depth / 100;
  }
  return getActualModuleWidth(chair); // fallback: assume square
};

/**
 * Get the projected half-width of a module along the X axis after rotation.
 * For a box of width W and depth D rotated by angle θ, the half-extent along X is:
 *   W/2 * |cos θ| + D/2 * |sin θ|
 */
export const getProjectedHalfWidth = (chair) => {
  const w = getActualModuleWidth(chair) / 2;
  const d = getActualModuleDepth(chair) / 2;
  const angle = chair.rotation || 0;
  return w * Math.abs(Math.cos(angle)) + d * Math.abs(Math.sin(angle));
};

/**
 * Resolves custom or auto-calculated position for a chair
 */
export const getResolvedPosition = (chair, autoPositions) => {
  return chair.customPosition ?? autoPositions.get(chair.id) ?? [0, 0, 0];
};

/**
 * Gets all chairs in the same group as the given chair
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
 * Finds attachable neighbors for a chair being dropped.
 * Uses rotation-aware projected widths so snapped positions are edge-to-edge.
 */
export const findAttachableNeighbors = (draggedChair, pos, chairs, autoPositions) => {
  const attachable = [];

  if (isPouf(draggedChair)) return attachable;

  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;
    if (isPouf(otherChair)) return;

    // Don't re-snap within the same group
    if (draggedChair.groupId && otherChair.groupId === draggedChair.groupId) return;

    const chairPos = getResolvedPosition(otherChair, autoPositions);
    const dx = chairPos[0] - pos.x;
    const dz = chairPos[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < SNAP_DISTANCE) {
      const direction = pos.x < chairPos[0] ? -1 : 1;

      // Use rotation-aware projected half-widths for accurate edge-to-edge placement
      const neighborHalfWidth = getProjectedHalfWidth(otherChair);
      const draggedHalfWidth = getProjectedHalfWidth(draggedChair);
      const spacing = neighborHalfWidth + draggedHalfWidth;

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
 * Finds snap target for previewing where a dragged module will land.
 * Uses rotation-aware projected widths and excludes same-group members.
 */
export const findSnapTarget = (draggedChair, pos, chairs, autoPositions) => {
  if (isPouf(draggedChair)) return null;

  let nearest = null;
  let nearestDist = Infinity;

  chairs.forEach((otherChair) => {
    if (otherChair.id === draggedChair.id) return;
    if (isPouf(otherChair)) return;

    // FIX: exclude same-group members from snap preview (was missing before)
    if (draggedChair.groupId && otherChair.groupId === draggedChair.groupId) return;

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

  // Use rotation-aware projected half-widths
  const neighborHalfWidth = getProjectedHalfWidth(nearest);
  const draggedHalfWidth = getProjectedHalfWidth(draggedChair);
  const spacing = neighborHalfWidth + draggedHalfWidth;

  return {
    neighborId: nearest.id,
    neighborPosition: neighborPos,
    snappedPosition: [
      neighborPos[0] + direction * spacing,
      0,
      neighborPos[2],
    ],
    draggedWidth: getActualModuleWidth(draggedChair),
    neighborGroupId: nearest.groupId,
  };
};

/**
 * Check if a chair should be detached from its group based on drag distance.
 */
export const shouldDetach = (chair, pos, chairs, autoPositions) => {
  if (!chair.groupId) return false;

  const groupMembers = chairs.filter(
    (c) => c.groupId === chair.groupId && c.id !== chair.id
  );

  for (const member of groupMembers) {
    const memberPos = getResolvedPosition(member, autoPositions);
    const dx = memberPos[0] - pos.x;
    const dz = memberPos[2] - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < DETACH_DISTANCE) {
      return false;
    }
  }

  return true;
};

/**
 * Get the group center position (average of all member positions)
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
 * Recalculate positions for all group members when one is moved.
 * Translates all members by the same delta so the group moves together.
 */
export const recalculateGroupPositions = (
  draggedChair,
  newPos,
  chairs,
  autoPositions
) => {
  const newPositions = new Map(autoPositions);

  if (!draggedChair.groupId) {
    newPositions.set(draggedChair.id, [newPos.x, newPos.y, newPos.z]);
    return newPositions;
  }

  const groupMembers = chairs.filter(
    (c) => c.groupId === draggedChair.groupId
  );

  if (groupMembers.length <= 1) {
    newPositions.set(draggedChair.id, [newPos.x, newPos.y, newPos.z]);
    return newPositions;
  }

  const draggedPos = getResolvedPosition(draggedChair, autoPositions);
  const offsetX = newPos.x - draggedPos[0];
  const offsetZ = newPos.z - draggedPos[2];

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
