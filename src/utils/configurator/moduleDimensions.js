/**
 * Module Dimensions Mapping
 * Maps module IDs to their actual physical dimensions in centimeters
 * Format: { width (cm), depth (cm), height (cm), originX (m), originZ (m) }
 * 
 * originX/originZ represent where the GLB model's origin point is located
 * relative to the front-left corner of the module's bounding box (in METERS)
 */
export const MODULE_DIMENSIONS = {
  // BASIC MODULES
  "jump-center": { width: 114, depth: 116, height: 100, originX: 0.53, originZ: 0.63 },
  "jump-left": { width: 119, depth: 116, height: 100, originX: 0.57, originZ: 0.67 },
  "jump-right": { width: 119, depth: 116, height: 100, originX: 0.56, originZ: 0.66 },

  // ANGLE MODULES
  "jump-angle": { width: 120, depth: 123, height: 200, originX: 0.56, originZ: 0.66 },
  "jump-bigangle": { width: 152, depth: 149, height: 200, originX: 0.71, originZ: 0.91 },

  // SPECIAL SEATS
  "jump-bigseat": { width: 207, depth: 152, height: 100, originX: 1.01, originZ: 0.88 },
  "jump-pouf": { width: 120, depth: 85, height: 42, originX: 0.58, originZ: 0.43 },

  // CHAISE MODULES
  "jump-chaisepouf-left": { width: 162, depth: 170, height: 110, originX: 0.61, originZ: 1.09 },
  "jump-chaisepouf-right": { width: 162, depth: 170, height: 110, originX: 0.99, originZ: 1.09 },
  "jump-seatpouf-left": { width: 147, depth: 112, height: 170, originX: 0.97, originZ: 0.76 },
  "jump-seatpouf-right": { width: 140, depth: 112, height: 170, originX: 0.45, originZ: 0.76 },
};

/**
 * Get dimensions for a specific module
 * @param {string} moduleId - The module ID (e.g., "jump-center")
 * @returns {{ width: number, depth: number, height: number, originX: number, originZ: number }} Dimensions
 */
export const getModuleDimensions = (moduleId) => {
  return MODULE_DIMENSIONS[moduleId] || { width: 99, depth: 99, height: 100, originX: 0, originZ: 0 };
};
