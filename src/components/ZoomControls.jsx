import React from "react";

export default function ZoomControls({ zoom, setZoom }) {
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 10 && value <= 400) {
      setZoom(value);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        onClick={handleZoomOut}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
        }}
        title="Zoom Out"
      >
        −
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type="number"
          value={zoom}
          onChange={handleChange}
          style={{
            width: "60px",
            padding: "6px 8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "13px",
            textAlign: "center",
          }}
          min="10"
          max="400"
        />
        <span style={{ fontSize: "12px", color: "#666" }}>%</span>
      </div>
      <button
        onClick={handleZoomIn}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
        }}
        title="Zoom In"
      >
        +
      </button>
    </div>
  );
}
