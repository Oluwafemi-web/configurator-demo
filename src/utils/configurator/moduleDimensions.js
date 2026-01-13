/**
 * Module Dimensions Mapping
 * Maps module IDs to their actual physical dimensions in centimeters
 * Format: { width (cm), depth (cm), height (cm) }
 */
export const MODULE_DIMENSIONS = {
  // BASIC MODULES
  "jump-center": { width: 99, depth: 99, height: 100 },
  "jump-left": { width: 82, depth: 99, height: 100 },
  "jump-right": { width: 82, depth: 99, height: 100 },

  // ANGLE MODULES
  "jump-angle": { width: 122, depth: 155, height: 100 },
  "jump-bigangle": { width: 152, depth: 152, height: 100 },

  // SPECIAL SEATS
  "jump-bigseat": { width: 99, depth: 99, height: 100 },
  "jump-pouf": { width: 99, depth: 99, height: 100 },

  // CHAISE MODULES
  "jump-chaisepouf-left": { width: 45, depth: 99, height: 100 },
  "jump-chaisepouf-right": { width: 45, depth: 99, height: 100 },
  "jump-seatpouf-left": { width: 45, depth: 99, height: 100 },
  "jump-seatpouf-right": { width: 45, depth: 99, height: 100 },
};

/**
 * Get dimensions for a specific module
 * @param {string} moduleId - The module ID (e.g., "jump-center")
 * @returns {{ width: number, depth: number, height: number }} Dimensions in cm
 */
export const getModuleDimensions = (moduleId) => {
  return MODULE_DIMENSIONS[moduleId] || { width: 99, depth: 99, height: 100 };
};
