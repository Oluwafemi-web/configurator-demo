import { useState } from "react";
import { upholsteryCategories} from "../constants";

/**
 * FabricSelector - UI for selecting fabric textures
 * @param {string} selectedFabric - Currently selected fabric path
 * @param {Function} onFabricSelect - Callback when fabric is selected
 */
export default function FabricSelector({ selectedFabric, onFabricSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 10,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 24px",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          marginBottom: isOpen ? "10px" : "0",
        }}
      >
        {isOpen ? "Close Fabrics" : "Select Fabric"}
      </button>

      {isOpen && (
        <div
          style={{
            backgroundColor: "#fff",
            border: "2px solid #000",
            borderRadius: "4px",
            padding: "15px",
            maxWidth: "300px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Upholstery Fabrics
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {upholsteryCategories.map((category) => (
              <div key={category.name} style={{ gridColumn: "1 / -1", marginBottom: "10px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px", fontSize: "12px", color: "#666" }}>
                  {category.name}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  {category.items.map((fabric) => (
                    <div
                      key={fabric.id}
                      onClick={() => {
                        onFabricSelect(fabric.path);
                        setIsOpen(false);
                      }}
                      style={{
                        cursor: "pointer",
                        border:
                          selectedFabric === fabric.path
                            ? "3px solid #000"
                            : "1px solid #ccc",
                        borderRadius: "4px",
                        overflow: "hidden",
                        transition: "all 0.2s",
                      }}
                    >
                      <img
                        src={fabric.path}
                        alt={fabric.label}
                        style={{
                          width: "100%",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          padding: "8px",
                          fontSize: "12px",
                          textAlign: "center",
                          backgroundColor:
                            selectedFabric === fabric.path ? "#f0f0f0" : "#fff",
                        }}
                      >
                        {fabric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
