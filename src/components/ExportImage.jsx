/**
 * ExportImage - Downloads a PNG snapshot of the current canvas
 * @param {Object} canvasRef - Reference to the Three.js canvas container
 */
export default function ExportImage({ canvasRef }) {
  const handleExportImage = () => {
    if (!canvasRef || !canvasRef.current) {
      alert("Canvas not ready for export");
      return;
    }

    try {
      let canvas = canvasRef.current;
      if (canvas.tagName !== "CANVAS") {
        canvas = canvas.querySelector("canvas");
      }

      if (!canvas) {
        throw new Error("Could not find canvas element");
      }

      const dataUrl = canvas.toDataURL("image/jpeg");
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `sofa-config-${timestamp}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("Failed to export image. Please try again.");
    }
  };

  return (
    <button
      onClick={handleExportImage}
      style={{
        padding: "6px 12px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
        fontSize: "11px",
        transition: "all 0.2s",
        marginLeft: "8px",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = "#f5f5f5";
        e.target.style.borderColor = "#999";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "#fff";
        e.target.style.borderColor = "#ccc";
      }}
      title="Download PNG"
    >
      EXPORT IMAGE
    </button>
  );
}
