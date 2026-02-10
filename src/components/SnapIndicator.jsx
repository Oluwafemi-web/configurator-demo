import React from "react";

export default function SnapIndicator({ isActive, snapInfo }) {
  if (!isActive || !snapInfo) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)",
        color: "#fff",
        padding: "14px 32px",
        borderRadius: "30px",
        fontSize: "15px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 1000,
      }}
    >
      <span style={{ fontSize: "20px" }}></span>
      <span>Let go of the model now</span>
    </div>
  );
}
