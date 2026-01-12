import { getVariantKeyFromModelPath } from "./getVariantKeyFromModelPath";
import { sortVariantKeys } from "./sortVariantKeys";

/**
 * Derives variant keys from chairs array
 * @param {Array} chairs - Array of chair objects
 * @returns {string[]} - Sorted array of variant keys
 */
export const deriveVariantKeysFromChairs = (chairs) => {
  return sortVariantKeys(
    chairs
      .map((chair) => getVariantKeyFromModelPath(chair?.sofa?.modelPath))
      .filter(Boolean)
  );
};
