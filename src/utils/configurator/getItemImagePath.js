/**
 * Maps item IDs to front image paths
 * @param {string} itemId - The item ID to map
 * @returns {string} - The image path for the item
 */
export const getItemImagePath = (itemId) => {
  const imageMap = {
    "jump-center": "/frontimage/JUMPCenter.jpg",
    "jump-left": "/frontimage/JUMP_Left.jpg",
    "jump-right": "/frontimage/JUMP_Right.jpg",
    "jump-angle": "/frontimage/JUMP_Angle.jpg",
    "jump-bigangle": "/frontimage/JUMP_Big_Angle.jpg",
    "jump-bigseat": "/frontimage/JUMP_Big_Seat.jpg",
    "jump-pouf": "/frontimage/JUMP_Pouf.jpg",
    "jump-chaisepouf-left": "/frontimage/JUMP_Chaise_Pouf_Left.jpg",
    "jump-chaisepouf-right": "/frontimage/JUMP_Chaise_Pouf_Right.jpg",
    "jump-seatpouf-left": "/frontimage/JUMP_Seat_Pouf_Left.jpg",
    "jump-seatpouf-right": "/frontimage/JUMP_Seat_Pouf_Right.jpg",
  };
  return imageMap[itemId] || "/frontimage/placeholder.jpg";
};
