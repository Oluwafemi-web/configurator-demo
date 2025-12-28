/**
 * ViewModeToggle - Toggle between 2D and 3D view modes
 * @param {string} viewMode - Current view mode ("2D" or "3D")
 * @param {Function} onViewModeChange - Callback when view mode changes
 */
export default function ViewModeToggle({ viewMode, onViewModeChange }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "flex",
        gap: "10px",
        zIndex: 10,
      }}
    >
      <button
        onClick={() => onViewModeChange("2D")}
        style={{
          padding: "10px 20px",
          backgroundColor: viewMode === "2D" ? "#000" : "#fff",
          color: viewMode === "2D" ? "#fff" : "#000",
          border: "2px solid #000",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          transition: "all 0.2s",
        }}
      >
        2D
      </button>
      <button
        onClick={() => onViewModeChange("3D")}
        style={{
          padding: "10px 20px",
          backgroundColor: viewMode === "3D" ? "#000" : "#fff",
          color: viewMode === "3D" ? "#fff" : "#000",
          border: "2px solid #000",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          transition: "all 0.2s",
        }}
      >
        3D
      </button>
    </div>
  );
}
