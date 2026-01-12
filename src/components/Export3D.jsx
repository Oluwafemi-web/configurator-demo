import JSZip from "jszip";

/**
 * Export3D - Downloads all 3D model files currently used in the scene as a ZIP.
 * @param {Array} modules - Array of chair modules in the scene
 */
export default function Export3D({ modules = [] }) {
  const handleExport3D = async () => {
    if (!modules || modules.length === 0) {
      alert("No modules in the scene to export.");
      return;
    }

    try {
      const zip = new JSZip();

      // Collect unique model paths from the current composition
      const uniquePaths = Array.from(
        new Set(
          modules
            .map((m) => m?.sofa?.modelPath)
            .filter(Boolean)
        )
      );

      if (uniquePaths.length === 0) {
        alert("No model files found to export.");
        return;
      }

      // Fetch each model and add it to the ZIP
      await Promise.all(
        uniquePaths.map(async (path) => {
          const response = await fetch(path);
          if (!response.ok) {
            console.warn(`Failed to fetch model at ${path}`);
            return;
          }
          const blob = await response.blob();
          const url = new URL(path, window.location.origin);
          const fileName = url.pathname.split("/").pop() || "model.glb";
          zip.file(fileName, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `sofa-config-models-${timestamp}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting 3D models:", error);
      alert("Failed to export 3D models. Please try again.");
    }
  };

  return (
    <button
      onClick={handleExport3D}
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
      title="Download 3D models as ZIP"
    >
      EXPORT 3D
    </button>
  );
}

