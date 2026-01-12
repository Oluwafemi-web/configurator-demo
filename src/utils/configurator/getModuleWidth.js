const CHAIR_WIDTH = 1.14;

/**
 * Calculates module width from dimension metrics
 * @param {Object} chair - Chair object with sofa dimensions
 * @returns {number} - Module width in meters
 */
export const getModuleWidth = (chair) => {
  const metric = chair?.sofa?.dimensionsMetric ?? "";
  const firstValue = parseFloat(metric.split("x")[0]);
  if (!Number.isFinite(firstValue)) return CHAIR_WIDTH;
  return firstValue / 100;
};
