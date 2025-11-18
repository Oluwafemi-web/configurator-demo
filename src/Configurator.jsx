import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import Palette from "./Palette";
import { useState, useMemo, useEffect } from "react";
import { detectPartsFromModel } from "./utils/detectParts";

const STAGES = {
  landing: "landing",
  selection: "selection",
  builder: "builder",
};

const upholsteryTextures = [
  {
    id: "beige-upholstery",
    label: "Beige_ulphostery",
    path: "/textures/Ulphostery/Beige_ulphostery.jpg",
  },
  {
    id: "black-upholstery",
    label: "Black_ulphostery",
    path: "/textures/Ulphostery/Black_ulphostery.jpg",
  },
  {
    id: "blue-midnight-upholstery",
    label: "Blu_Midnight_ulphostery",
    path: "/textures/Ulphostery/Blu_Midnight_ulphostery.jpg",
  },
  {
    id: "blue-upholstery",
    label: "Blu_ulphostery",
    path: "/textures/Ulphostery/Blu_ulphostery.jpg",
  },
  {
    id: "gray-upholstery",
    label: "Gray_ulphostery",
    path: "/textures/Ulphostery/Gray_ulphostery.jpg",
  },
  {
    id: "red-upholstery",
    label: "Red_ulphostery",
    path: "/textures/Ulphostery/Red_ulphostery.jpg",
  },
  {
    id: "white-upholstery",
    label: "White_ulphostery",
    path: "/textures/Ulphostery/White_ulphostery.jpg",
  },
  {
    id: "yellow-upholstery",
    label: "Yellow_ulphostery",
    path: "/textures/Ulphostery/Yellow_ulphostery.jpg",
  },
];

const feetTextures = [
  {
    id: "metal-texture",
    label: "METAL",
    path: "/textures/metal_texture_FEET.jpg",
  },
  {
    id: "wood-texture",
    label: "WOOD",
    path: "/textures/Wood_texture_FEET.jpg",
  },
];

const SOFA_FAMILY_NAME = "Jump Sofa";

const sofaCatalog = [
  {
    category: "POLTRONA",
    items: [
      {
        id: "02D301",
        name: "02D301",
        description: "Modulo singolo",
        dimensionsMetric: "92 x 114 x 70 CM",
        dimensionsImperial: '36 1/4" x 44 7/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_CENTER.glb",
        fabricGroup: "POLTORONA",
      },
    ],
  },
  {
    category: "DIVANO",
    items: [
      {
        id: "02D303",
        name: "02D303",
        description: "Modulo DX",
        dimensionsMetric: "114 x 215 x 70 CM",
        dimensionsImperial: '44 7/8" x 84 5/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_DX.glb",
        fabricGroup: "DIVANO",
      },
    ],
  },
  {
    category: "ELEMENTO",
    items: [
      {
        id: "02D305",
        name: "02D305",
        description: "Modulo SX",
        dimensionsMetric: "114 x 265 x 70 CM",
        dimensionsImperial: '44 7/8" x 104 3/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_SX.glb",
        fabricGroup: "ELEMENTO",
      },
    ],
  },
];

const VARIANT_CONFIG = [
  {
    key: "center",
    title: "Modulo Centrale",
    description: "Elemento centrale per creare sezioni lineari.",
    badge: "CENTER",
  },
  {
    key: "left",
    title: "Modulo Sinistro",
    description: "Terminale sinistro (modello DX).",
    badge: "DX",
  },
  {
    key: "right",
    title: "Modulo Destro",
    description: "Terminale destro (modello SX).",
    badge: "SX",
  },
];

export default function Configurator() {
  const [stage, setStage] = useState(STAGES.landing);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [selectedSofa, setSelectedSofa] = useState(null);

  const [selectedChairTexture, setSelectedChairTexture] = useState(null);
  const [selectedPillowTexture, setSelectedPillowTexture] = useState(null);
  const [selectedFeetTexture, setSelectedFeetTexture] = useState(null);
  const [selectedChairOptionId, setSelectedChairOptionId] = useState(null);
  const [selectedPillowOptionId, setSelectedPillowOptionId] = useState(null);
  const [selectedFeetOptionId, setSelectedFeetOptionId] = useState(null);
  const [detectedParts, setDetectedParts] = useState([]);
  const [isDetectingParts, setIsDetectingParts] = useState(false);

  // State for managing multiple chairs
  const [chairs, setChairs] = useState([]);
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const [viewMode, setViewMode] = useState("3d"); // "2d" or "3d"

  const sofaVariants = useMemo(() => {
    const variants = { center: null, left: null, right: null };
    sofaCatalog.forEach((section) => {
      section.items.forEach((item) => {
        if (item.modelPath.includes("CENTER")) {
          variants.center = item;
        } else if (item.modelPath.includes("DX")) {
          variants.left = item;
        } else if (item.modelPath.includes("SX")) {
          variants.right = item;
        }
      });
    });
    return variants;
  }, []);

  // Detect parts from model when sofa is selected
  useEffect(() => {
    if (selectedSofa?.modelPath) {
      setIsDetectingParts(true);
      detectPartsFromModel(selectedSofa.modelPath)
        .then((parts) => {
          setDetectedParts(parts);
          setIsDetectingParts(false);
        })
        .catch((error) => {
          console.error("Error detecting parts:", error);
          setDetectedParts(["chair", "pillow", "feet"]); // Fallback
          setIsDetectingParts(false);
        });
    } else {
      setDetectedParts([]);
    }
  }, [selectedSofa?.modelPath]);

  // Close module menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModuleMenu && !event.target.closest("[data-module-menu]")) {
        setShowModuleMenu(false);
      }
    };

    if (showModuleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showModuleMenu]);

  const availableParts = detectedParts.length > 0 ? detectedParts : [];
  const colorSelectors = useMemo(() => {
    const selectors = [];

    if (availableParts.includes("chair")) {
      selectors.push({
        label: "CHAIR",
        options: upholsteryTextures,
        selectedOptionId: selectedChairOptionId,
        onSelect: (option) => {
          setSelectedChairOptionId(option.id);
          setSelectedChairTexture(option.path);
          // Apply texture to all chairs
          setChairs((prev) =>
            prev.map((chair) => ({
              ...chair,
              chairTexture: option.path,
            }))
          );
        },
      });
    }
    if (availableParts.includes("pillow")) {
      selectors.push({
        label: "PILLOW",
        options: upholsteryTextures,
        selectedOptionId: selectedPillowOptionId,
        onSelect: (option) => {
          setSelectedPillowOptionId(option.id);
          setSelectedPillowTexture(option.path);
          // Apply texture to all chairs
          setChairs((prev) =>
            prev.map((chair) => ({
              ...chair,
              pillowTexture: option.path,
            }))
          );
        },
      });
    }
    if (availableParts.includes("feet")) {
      selectors.push({
        label: "FEET",
        options: feetTextures,
        selectedOptionId: selectedFeetOptionId,
        onSelect: (option) => {
          setSelectedFeetOptionId(option.id);
          setSelectedFeetTexture(option.path);
          // Apply texture to all chairs
          setChairs((prev) =>
            prev.map((chair) => ({
              ...chair,
              feetTexture: option.path,
            }))
          );
        },
      });
    }
    return selectors;
  }, [
    availableParts,
    selectedChairOptionId,
    selectedPillowOptionId,
    selectedFeetOptionId,
  ]);

  const handleLaunchConfigurator = () => setStage(STAGES.selection);

  const handleConfirmSelection = () => {
    if (!pendingSelection) return;
    setSelectedSofa(pendingSelection);
    setStage(STAGES.builder);
    setSelectedChairTexture(null);
    setSelectedPillowTexture(null);
    setSelectedFeetTexture(null);
    setSelectedChairOptionId(null);
    setSelectedPillowOptionId(null);
    setSelectedFeetOptionId(null);
    // Initialize with the selected sofa as the first chair
    setChairs([
      {
        id: Date.now(),
        sofa: pendingSelection,
        chairTexture: null,
        pillowTexture: null,
        feetTexture: null,
        position: "center", // center, left, right
      },
    ]);
  };

  // Calculate contiguous positions: left modules to negative X, centers from 0+, right modules after centers
  const getChairPosition = (chair) => {
    const chairWidth = 1.14;
    const leftChairs = chairs
      .filter((c) => c.position === "left")
      .sort((a, b) => a.id - b.id);
    const centerChairs = chairs
      .filter((c) => c.position === "center")
      .sort((a, b) => a.id - b.id);
    const rightChairs = chairs
      .filter((c) => c.position === "right")
      .sort((a, b) => a.id - b.id);

    const positionsMap = new Map();

    leftChairs.forEach((lc, idx) => {
      const offset = leftChairs.length - idx;
      positionsMap.set(lc.id, [-offset * chairWidth, 0, 0]);
    });

    centerChairs.forEach((cc, idx) => {
      positionsMap.set(cc.id, [idx * chairWidth, 0, 0]);
    });

    const centerCount = Math.max(centerChairs.length, 1);
    rightChairs.forEach((rc, idx) => {
      positionsMap.set(rc.id, [(centerCount + idx) * chairWidth, 0, 0]);
    });

    return positionsMap.get(chair.id) ?? [0, 0, 0];
  };

  const handleAddChair = (sofa) => {
    if (!sofa) return;

    // Determine position based on model path
    let position;
    if (sofa.modelPath.includes("SX")) {
      position = "right";
    } else if (sofa.modelPath.includes("DX")) {
      position = "left";
    } else if (sofa.modelPath.includes("CENTER")) {
      position = "center";
    } else {
      position = "right"; // Default to right
    }

    const newChair = {
      id: Date.now(),
      sofa: sofa,
      chairTexture: selectedChairTexture,
      pillowTexture: selectedPillowTexture,
      feetTexture: selectedFeetTexture,
      position: position,
    };

    setChairs((prev) => {
      // If adding to left, prepend; if center or right, append
      if (position === "left") {
        return [newChair, ...prev];
      } else {
        return [...prev, newChair];
      }
    });

    setShowModuleMenu(false);
  };

  // Get all available modules from catalog
  const availableModules = sofaCatalog.flatMap((cat) => cat.items);

  const handleRemoveChair = (chairId) => {
    setChairs((prev) => prev.filter((chair) => chair.id !== chairId));
  };

  const renderLandingScreen = () => (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f2",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "60px 8%",
        gap: "40px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 320px" }}>
        <p style={{ letterSpacing: "0.4em", fontSize: "0.9rem" }}>
          SPAGNOLCOMPANY
        </p>
        <h1 style={{ fontSize: "3rem", margin: "10px 0" }}>
          Scopri tutte le configurazioni
        </h1>
        <p style={{ maxWidth: "420px", color: "#4a4a4a", lineHeight: 1.6 }}>
          Cambia forme e materiali, osserva il prodotto in ogni dettaglio e crea
          il modulo perfetto per il tuo spazio.
        </p>
        <button
          onClick={handleLaunchConfigurator}
          style={{
            marginTop: "30px",
            padding: "14px 26px",
            borderRadius: "999px",
            border: "1px solid #1b1b1b",
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.95rem",
            letterSpacing: "0.05em",
          }}
        >
          CONFIGURA SISTEMA MODULARE
        </button>
      </div>
      <div
        style={{
          flex: "1 1 380px",
          minHeight: "320px",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=60')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );

  const renderSelectionScreen = () => (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f2",
        padding: "40px 6%",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      <button
        onClick={() => {
          setStage(STAGES.landing);
          setPendingSelection(null);
        }}
        style={{
          alignSelf: "flex-start",
          border: "none",
          background: "transparent",
          fontSize: "0.9rem",
          cursor: "pointer",
          color: "#4a4a4a",
        }}
      >
        ← Torna indietro
      </button>
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ letterSpacing: "0.35em", fontSize: "0.75rem" }}>
          COLLEZIONE
        </p>
        <h2 style={{ fontSize: "2rem", margin: "8px 0 24px 0" }}>
          {SOFA_FAMILY_NAME}
        </h2>
        <div className="flex gap-3">
          {VARIANT_CONFIG.map((variant) => {
            const item = sofaVariants[variant.key];
            if (!item) return null;
            const isSelected = pendingSelection?.id === item.id;
            return (
              <div
                key={variant.key}
                onClick={() => setPendingSelection(item)}
                style={{
                  width: "100%",
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "22px 24px",
                  border: isSelected ? "2px solid #000" : "1px solid #e0e0e0",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? "0 14px 28px rgba(0,0,0,0.12)"
                    : "0 8px 16px rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    height: "110px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#d9d8d6,#f0f0ef)",
                    marginBottom: "16px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    {variant.title}
                  </div>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.25em",
                      color: "#7a7a7a",
                    }}
                  >
                    {variant.badge}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px 0", color: "#4a4a4a" }}>
                  {variant.description}
                </p>
                <div style={{ fontSize: "0.85rem", color: "#1b1b1b" }}>
                  {item.name} • {item.dimensionsMetric}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#7a7a7a" }}>
                  {item.dimensionsImperial}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={handleConfirmSelection}
          disabled={!pendingSelection}
          style={{
            padding: "14px 32px",
            borderRadius: "999px",
            border: "1px solid #1b1b1b",
            background: pendingSelection ? "#1b1b1b" : "#d2d2d2",
            color: pendingSelection ? "#fff" : "#707070",
            cursor: pendingSelection ? "pointer" : "not-allowed",
            letterSpacing: "0.1em",
          }}
        >
          INSERISCI IN SCENA
        </button>
      </div>
    </div>
  );

  const renderBuilderScreen = () => (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f4f2",
        padding: "30px 4%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ letterSpacing: "0.3em", fontSize: "0.75rem" }}>
            SPAGNOLCOMPANY
          </p>
          <h2 style={{ margin: "6px 0" }}>
            {selectedSofa?.description || selectedSofa?.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#4a4a4a" }}>
            {selectedSofa?.dimensionsMetric} •{" "}
            {selectedSofa?.dimensionsImperial}
          </p>
        </div>
        <button
          onClick={() => {
            setStage(STAGES.selection);
            setPendingSelection(selectedSofa);
          }}
          style={{
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid #1b1b1b",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Cambia Modello
        </button>
      </div>

      <div
        className="configurator-container"
        style={{
          display: "flex",
          width: "90%",
          maxWidth: "1200px",
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          className="color-selectors-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            backgroundColor: "#fafafa",
            minWidth: "200px",
          }}
        >
          {isDetectingParts ? (
            <div className="text-sm text-gray-500">Caricamento...</div>
          ) : colorSelectors.length === 0 ? (
            <div className="text-sm text-gray-500">
              Nessuna parte disponibile
            </div>
          ) : (
            colorSelectors.map((selector) => (
              <Palette
                key={selector.label}
                label={selector.label}
                options={selector.options}
                selectedOptionId={selector.selectedOptionId}
                onSelect={selector.onSelect}
              />
            ))
          )}
        </div>

        <div
          className="canvas-container"
          style={{ flex: 1, height: "620px", position: "relative" }}
        >
          <Canvas
            camera={
              viewMode === "2d"
                ? {
                    position: [0, 1.5, 5],
                    zoom: 50,
                  }
                : { position: [2, 2, 2], fov: 45 }
            }
            orthographic={viewMode === "2d"}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 3, 3]} intensity={0.5} />
            {chairs.length > 0 ? (
              chairs.map((chair) => {
                const position = getChairPosition(chair);
                return (
                  <Model
                    key={chair.id}
                    modelPath={chair.sofa.modelPath}
                    chairTexturePath={
                      chair.chairTexture || selectedChairTexture
                    }
                    pillowTexturePath={
                      chair.pillowTexture || selectedPillowTexture
                    }
                    feetTexturePath={chair.feetTexture || selectedFeetTexture}
                    position={position}
                  />
                );
              })
            ) : selectedSofa ? (
              <Model
                modelPath={selectedSofa.modelPath}
                chairTexturePath={selectedChairTexture}
                pillowTexturePath={selectedPillowTexture}
                feetTexturePath={selectedFeetTexture}
              />
            ) : null}
            {viewMode === "3d" ? (
              <OrbitControls
                enablePan={true}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
              />
            ) : (
              <OrbitControls
                enablePan={true}
                enableRotate={true}
                enableZoom={true}
                minZoom={0.5}
                maxZoom={3}
              />
            )}
            <Environment preset="apartment" />
          </Canvas>

          {/* View Mode and Add Module Buttons */}
          <div
            data-module-menu
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* View Mode Buttons */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "#fff",
                border: "2px solid #1b1b1b",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              <button
                onClick={() => setViewMode("2d")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "2d" ? "#1b1b1b" : "transparent",
                  color: viewMode === "2d" ? "#fff" : "#1b1b1b",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode("3d")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "3d" ? "#1b1b1b" : "transparent",
                  color: viewMode === "3d" ? "#fff" : "#1b1b1b",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                3D
              </button>
            </div>

            <button
              onClick={() => setShowModuleMenu(!showModuleMenu)}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "2px solid #1b1b1b",
                background: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ fontSize: "18px" }}>+</span>
              <span>Aggiungi modulo</span>
            </button>

            {/* Module Selection Menu */}
            {showModuleMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginBottom: "8px",
                  background: "#fff",
                  border: "2px solid #1b1b1b",
                  borderRadius: "8px",
                  padding: "12px",
                  minWidth: "200px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                    color: "#666",
                  }}
                >
                  Moduli disponibili
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {availableModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => handleAddChair(module)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#f5f5f5";
                        e.target.style.borderColor = "#1b1b1b";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.borderColor = "#e0e0e0";
                      }}
                    >
                      <div style={{ fontWeight: "500" }}>{module.name}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {module.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (stage === STAGES.landing) return renderLandingScreen();
  if (stage === STAGES.selection) return renderSelectionScreen();
  return renderBuilderScreen();
}
