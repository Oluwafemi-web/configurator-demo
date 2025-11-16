/**
 * Extracts a dominant color from an image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} - Hex color string
 */
export async function extractColorFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external images
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        // Sample pixels from the image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Calculate average color
        let r = 0, g = 0, b = 0, count = 0;
        const sampleStep = 10; // Sample every 10th pixel for performance
        
        for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
          count++;
        }
        
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        
        // Convert to hex
        const hex = `#${[r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
        
        resolve(hex);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
}

