/**
 * Maps item IDs to front image paths
 * @param {string} itemId - The item ID to map
 * @returns {string} - The image path for the item
 */
export const getItemImagePath = (itemId) => {
  const imageMap = {
    "jump-center": "/frontimage/Jump_Center.png",
    "jump-left": "/frontimage/Jump_Left.png",
    "jump-right": "/frontimage/Jump_Right.png",
    "jump-angle": "/frontimage/Jump_Angle.png",
    "jump-bigangle": "/frontimage/Jump_BigAngle.png",
    "jump-bigseat": "/frontimage/Jump_BigSeat.png",
    "jump-pouf": "/frontimage/Jump_Pouf.png",
    "jump-chaisepouf-left": "/frontimage/Jump_Chaise_Pouf_Left.png",
    "jump-chaisepouf-right": "/frontimage/Jump_Chaise_Pouf_Right.png",
    "jump-seatpouf-left": "/frontimage/Jump_SeatPouf_Left.png",
    "jump-seatpouf-right": "/frontimage/Jump_SeatPouf_Right.png",
  };
  return imageMap[itemId] || "/frontimage/placeholder.png";
};
