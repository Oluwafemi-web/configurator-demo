/**
 * Maps model path to variant key (center, left, right)
 * @param {string} modelPath - The model path to analyze
 * @returns {string|null} - The variant key or null if not found
 */
export const getVariantKeyFromModelPath = (modelPath = "") => {
  const upperPath = modelPath.toUpperCase();
  if (upperPath.includes("CENTER")) return "center";
  if (upperPath.includes("DX")) return "left";
  if (upperPath.includes("SX")) return "right";
  return null;
};
