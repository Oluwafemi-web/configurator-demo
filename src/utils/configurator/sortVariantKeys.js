import { VARIANT_CONFIG } from "../../constants";

/**
 * Sorts variant keys based on predefined order from VARIANT_CONFIG
 * @param {string[]} keys - Array of variant keys to sort
 * @returns {string[]} - Sorted and deduplicated array of variant keys
 */
export const sortVariantKeys = (keys) => {
  const variantOrder = VARIANT_CONFIG.map((variant) => variant.key);
  
  return [...new Set(keys)].sort((a, b) => {
    const idxA = variantOrder.indexOf(a);
    const idxB = variantOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
};
