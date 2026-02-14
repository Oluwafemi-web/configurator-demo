// Barrel export for configurator utilities
export { getVariantKeyFromModelPath } from "./getVariantKeyFromModelPath";
export { sortVariantKeys } from "./sortVariantKeys";
export { deriveVariantKeysFromChairs } from "./deriveVariantKeysFromChairs";
export { getModuleWidth } from "./getModuleWidth";
export { getItemImagePath } from "./getItemImagePath";
export { 
  getResolvedPosition, 
  findSnapTarget, 
  findAttachableNeighbors,
  shouldDetach,
  recalculateGroupPositions,
  createGroupId,
  getGroupMembers,
  getActualModuleWidth,
} from "./positionCalculations";
export { calculateCompositionDimensions, calculateTotalDimensions } from "./calculateDimensions";

