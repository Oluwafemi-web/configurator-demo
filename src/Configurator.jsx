import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Line, Html } from "@react-three/drei";
import Model from "./Model";
import Palette from "./Palette";
import { useState, useMemo, useEffect, useRef } from "react";
import { detectPartsFromModel } from "./utils/detectParts";
import DraggableModule from "./components/DraggableModule";
import RotationRing from "./components/RotationRing";
import {
  STAGES,
  upholsteryTextures,
  feetTextures,
  SOFA_FAMILY_NAME,
  sofaCatalog,
  VARIANT_CONFIG,
} from "./constants";

// Camera Manager Component for refined camera control
function CameraManager({ viewMode, isDragging }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    if (viewMode === "2d") {
      // Lock to perfect top-down orthographic view
      camera.position.set(0, 50, 0);
      camera.rotation.set(-Math.PI / 2, 0, 0); // Point straight down
      camera.lookAt(0, 0, 0);
      camera.zoom = 5;
      camera.updateProjectionMatrix();
    } else {
      // 3D perspective view
      camera.position.set(6, 4, 6);
      camera.lookAt(0, 0, 0);
      camera.fov = 35;
      camera.updateProjectionMatrix();
    }
  }, [viewMode, camera]);

  // In 2D mode, completely disable camera controls
  if (viewMode === "2d") {
    return null; // No controls in 2D - locked top-down view
  }

  // 3D mode: full controls
  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!isDragging}
      minDistance={3}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.1}
    />
  );
}

export default function Configurator() {
  const [stage, setStage] = useState(STAGES.landing);
  const [pendingVariantKeys, setPendingVariantKeys] = useState([]);
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggingChairId, setDraggingChairId] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [actionPanelPos, setActionPanelPos] = useState({ x: 0, y: 0 });
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [rotationTargetId, setRotationTargetId] = useState(null);
  const [isDragging2D, setIsDragging2D] = useState(false);
  const canvasContainerRef = useRef(null);

  // State for right sidebar accordion panels
  const [expandedPanel, setExpandedPanel] = useState(null);

  const sofaVariants = useMemo(() => {
    const variants = { center: null, left: null, right: null };
    sofaCatalog.forEach((section) => {
      section.items.forEach((item) => {
        // Map fabricGroup to variant keys
        if (item.fabricGroup === "CENTER") {
          variants.center = item;
        } else if (item.fabricGroup === "LEFT") {
          variants.left = item;
        } else if (item.fabricGroup === "RIGHT") {
          variants.right = item;
        }
      });
    });
    return variants;
  }, []);

  const variantOrder = useMemo(
    () => VARIANT_CONFIG.map((variant) => variant.key),
    []
  );

  const getVariantKeyFromModelPath = (modelPath = "") => {
    const upperPath = modelPath.toUpperCase();
    if (upperPath.includes("CENTER")) return "center";
    if (upperPath.includes("DX")) return "left";
    if (upperPath.includes("SX")) return "right";
    return null;
  };

  const sortVariantKeys = (keys) => {
    return [...new Set(keys)].sort((a, b) => {
      const idxA = variantOrder.indexOf(a);
      const idxB = variantOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  const deriveVariantKeysFromChairs = () =>
    sortVariantKeys(
      chairs
        .map((chair) => getVariantKeyFromModelPath(chair?.sofa?.modelPath))
        .filter(Boolean)
    );

  const CHAIR_WIDTH = 1.14;
  const SNAP_DISTANCE = 0.9;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.25;

  const getModuleWidth = (chair) => {
    const metric = chair?.sofa?.dimensionsMetric ?? "";
    const firstValue = parseFloat(metric.split("x")[0]);
    if (!Number.isFinite(firstValue)) return CHAIR_WIDTH;
    return firstValue / 100;
  };

  const autoPositions = useMemo(() => {
    const positionsMap = new Map();
    const leftChairs = chairs.filter((c) => c.position === "left");
    const centerChairs = chairs.filter((c) => c.position === "center");
    const rightChairs = chairs.filter((c) => c.position === "right");

    let leftOffset = 0;
    for (let i = leftChairs.length - 1; i >= 0; i -= 1) {
      const chair = leftChairs[i];
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [-(leftOffset + half), 0, 0]);
      leftOffset += width;
    }

    let centerOffset = 0;
    centerChairs.forEach((chair) => {
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [centerOffset + half, 0, 0]);
      centerOffset += width;
    });

    let rightCursor = centerOffset > 0 ? centerOffset : 0;
    rightChairs.forEach((chair) => {
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [rightCursor + half, 0, 0]);
      rightCursor += width;
    });

    return positionsMap;
  }, [chairs]);

  const getResolvedPosition = (chair) =>
    chair.customPosition ?? autoPositions.get(chair.id) ?? [0, 0, 0];

  const findSnapTarget = (draggedChair, pos) => {
    let nearest = null;
    let nearestDist = Infinity;
    chairs.forEach((otherChair) => {
      if (otherChair.id === draggedChair.id) return;
      const chairPos = getResolvedPosition(otherChair);
      const dx = chairPos[0] - pos.x;
      const dz = chairPos[2] - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = otherChair;
      }
    });
    if (!nearest || nearestDist >= SNAP_DISTANCE) return null;
    const neighborPos = getResolvedPosition(nearest);
    const direction = pos.x < neighborPos[0] ? -1 : 1;
    const neighborWidth = getModuleWidth(nearest);
    const draggedWidth = getModuleWidth(draggedChair);
    const spacing = (neighborWidth + draggedWidth) / 2;
    return {
      neighborId: nearest.id,
      neighborPosition: neighborPos,
      snappedPosition: [
        neighborPos[0] + direction * spacing,
        0,
        neighborPos[2],
      ],
      draggedWidth,
    };
  };

  const handleDragStart = (chair) => {
    if (viewMode !== "2d") return;
    setDraggingChairId(chair.id);
    setIsDragging2D(true);
    setShowActionPanel(false);
    setRotationTargetId(null);
    setSnapPreview(null);
  };

  const handleDragMove = (chair, pos) => {
    if (viewMode !== "2d") return;
    const snap = findSnapTarget(chair, pos);
    if (snap) {
      setSnapPreview(snap);
    } else {
      setSnapPreview(null);
    }
  };

  const handleDragEnd = (chair, pos) => {
    if (viewMode !== "2d") return;
    setDraggingChairId(null);
    setIsDragging2D(false);
    const snap = findSnapTarget(chair, pos);
    const targetPosition = snap ? snap.snappedPosition : [pos.x, 0, pos.z];
    setSnapPreview(null);
    setChairs((prev) =>
      prev.map((c) =>
        c.id === chair.id ? { ...c, customPosition: targetPosition } : c
      )
    );
  };

  const handleSelectChair = (chair, event) => {
    if (viewMode !== "2d" || draggingChairId) return;
    event.stopPropagation();
    const nativeEvent = event?.nativeEvent ?? event;
    const containerRect = canvasContainerRef.current?.getBoundingClientRect();
    if (containerRect && nativeEvent) {
      setActionPanelPos({
        x: nativeEvent.clientX - containerRect.left,
        y: nativeEvent.clientY - containerRect.top,
      });
    }
    setSelectedChairId(chair.id);
    setShowActionPanel(true);
    setRotationTargetId(null);
  };

  const handleRotateRequest = () => {
    if (!selectedChairId) return;
    setRotationTargetId(selectedChairId);
    setShowActionPanel(false);
  };

  const handleRotateChange = (chairId, degrees) => {
    setChairs((prev) =>
      prev.map((chair) =>
        chair.id === chairId
          ? { ...chair, rotation: (degrees * Math.PI) / 180 }
          : chair
      )
    );
  };

  const selectedChair =
    chairs.find((chair) => chair.id === selectedChairId) ?? null;
  const rotationTarget =
    chairs.find((chair) => chair.id === rotationTargetId) ?? null;

  const getActionPanelStyle = () => {
    const width = 360;
    const height = 200;
    const container = canvasContainerRef.current;
    const maxLeft = container ? container.clientWidth - width - 20 : 0;
    const maxTop = container ? container.clientHeight - height - 20 : 0;
    const left = Math.max(20, Math.min(actionPanelPos.x, maxLeft));
    const top = Math.max(20, Math.min(actionPanelPos.y, maxTop));
    return { width, height, left, top };
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionPanel && !event.target.closest("[data-selection-menu]")) {
        setShowActionPanel(false);
        setSelectedChairId(null);
      }
    };
    if (showActionPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showActionPanel]);

  useEffect(() => {
    if (viewMode !== "2d") {
      setShowActionPanel(false);
      setRotationTargetId(null);
      setSnapPreview(null);
      setDraggingChairId(null);
    }
  }, [viewMode]);

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

  const handleZoomChange = (direction) => {
    setZoomLevel((prev) => {
      const next = direction === "in" ? prev + ZOOM_STEP : prev - ZOOM_STEP;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  };

  const handleLaunchConfigurator = () => setStage(STAGES.selection);

  const handleConfirmSelection = () => {
    // Find selected items from all categories by their IDs
    const selectedItems = pendingVariantKeys
      .map((selectedId) => {
        for (const category of sofaCatalog) {
          const found = category.items.find((item) => item.id === selectedId);
          if (found) return found;
        }
        return null;
      })
      .filter(Boolean);

    if (selectedItems.length === 0) return;

    setSelectedSofa(selectedItems[0]);
    setStage(STAGES.builder);
    setSelectedChairTexture(null);
    setSelectedPillowTexture(null);
    setSelectedFeetTexture(null);
    setSelectedChairOptionId(null);
    setSelectedPillowOptionId(null);
    setSelectedFeetOptionId(null);

    const timestamp = Date.now();
    const seededChairs = selectedItems.map((sofa, index) => ({
      id: timestamp + index,
      sofa,
      chairTexture: null,
      pillowTexture: null,
      feetTexture: null,
      position: getVariantKeyFromModelPath(sofa?.modelPath) ?? "right",
      customPosition: null,
      rotation: 0,
    }));

    setChairs(seededChairs);
  };

  const handleAddChair = (sofa) => {
    if (!sofa) return;

    // Determine position based on model path
    const position = getVariantKeyFromModelPath(sofa?.modelPath) ?? "right";

    const newChair = {
      id: Date.now(),
      sofa: sofa,
      chairTexture: selectedChairTexture,
      pillowTexture: selectedPillowTexture,
      feetTexture: selectedFeetTexture,
      position: position,
      customPosition: null,
      rotation: 0,
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

  const handleRemoveLastChair = () => {
    setChairs((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
  };

  // Helper function to map item IDs to front image paths
  const getItemImagePath = (itemId) => {
    const imageMap = {
      'jump-center': '/frontimage/Jump_Center.png',
      'jump-left': '/frontimage/Jump_Left.png',
      'jump-right': '/frontimage/Jump_Right.png',
      'jump-angle': '/frontimage/Jump_Angle.png',
      'jump-bigangle': '/frontimage/Jump_BigAngle.png',
      'jump-bigseat': '/frontimage/Jump_BigSeat.png',
      'jump-pouf': '/frontimage/Jump_Pouf.png',
      'jump-chaisepouf-left': '/frontimage/Jump_ChaisePouf.png',
      'jump-chaisepouf-right': '/frontimage/Jump_ChaisePouf_opposite.png',
      'jump-seatpouf-left': '/frontimage/Jump_SeatPouf.png',
      'jump-seatpouf-right': '/frontimage/Jump_SeatPouf_opposite.png',
    };
    return imageMap[itemId] || '/frontimage/placeholder.png';
  };


  const renderLandingScreen = () => (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e8e6e1",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "60px 8%",
        gap: "60px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 400px" }}>
        <p style={{
          letterSpacing: "0.15em",
          fontSize: "0.75rem",
          fontWeight: "400",
          marginBottom: "30px",
          color: "#3a3a3a"
        }}>
          Configurator
        </p>
        <h1 style={{
          fontSize: "3.5rem",
          margin: "0 0 20px 0",
          fontWeight: "300",
          letterSpacing: "0.2em",
          lineHeight: "1.1"
        }}>
          JUMP SOFA
        </h1>
        <p style={{
          maxWidth: "420px",
          color: "#6a6a6a",
          lineHeight: 1.6,
          fontSize: "0.95rem",
          marginBottom: "8px"
        }}>
          Scopri tutte le configurazioni, cambia forme
        </p>
        <p style={{
          maxWidth: "420px",
          color: "#6a6a6a",
          lineHeight: 1.6,
          fontSize: "0.95rem",
          marginBottom: "0"
        }}>
          e materiali.
        </p>
        <p style={{
          maxWidth: "420px",
          color: "#9a9a9a",
          lineHeight: 1.6,
          fontSize: "0.85rem",
          fontStyle: "italic",
          marginTop: "15px"
        }}>
          Clicca e produci in ogni settore.
        </p>
        <button
          onClick={handleLaunchConfigurator}
          style={{
            marginTop: "40px",
            padding: "12px 24px",
            borderRadius: "0",
            border: "1px solid #2a2a2a",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.85rem",
            letterSpacing: "0.1em",
            fontWeight: "400",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#2a2a2a";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#000";
          }}
        >
          CONFIGURA SISTEMA MODULARE
        </button>
      </div>
      <div
        style={{
          flex: "1 1 500px",
          minHeight: "400px",
          backgroundImage: "url('/sofa-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0",
          boxShadow: "none",
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
          setPendingVariantKeys([]);
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

      <div>
        <p style={{ letterSpacing: "0.35em", fontSize: "0.75rem", marginBottom: "8px" }}>
          COLLEZIONE
        </p>
        <h2 style={{ fontSize: "2rem", margin: "8px 0 24px 0" }}>
          {SOFA_FAMILY_NAME}
        </h2>

        {/* Iterate through all categories */}
        {sofaCatalog.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: "40px" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                letterSpacing: "0.15em",
                color: "#666",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              {category.category}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {category.items.map((item) => {
                const isSelected = pendingVariantKeys.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      setPendingVariantKeys((prev) => {
                        if (prev.includes(item.id)) {
                          return prev.filter((id) => id !== item.id);
                        }
                        return [...prev, item.id];
                      })
                    }
                    style={{
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
                        height: "15rem",
                        borderRadius: "14px",
                        backgroundImage: `url(${getItemImagePath(item.id)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#f4f4f4",
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
                        {item.name}
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "0.25em",
                          color: "#7a7a7a",
                        }}
                      >
                        {item.fabricGroup}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 8px 0", color: "#4a4a4a" }}>
                      {item.description}
                    </p>
                    <div style={{ fontSize: "0.85rem", color: "#1b1b1b" }}>
                      {item.dimensionsMetric}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#7a7a7a" }}>
                      {item.dimensionsImperial}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={handleConfirmSelection}
          disabled={pendingVariantKeys.length === 0}
          style={{
            padding: "14px 32px",
            borderRadius: "999px",
            border: "1px solid #1b1b1b",
            background: pendingVariantKeys.length > 0 ? "#1b1b1b" : "#d2d2d2",
            color: pendingVariantKeys.length > 0 ? "#fff" : "#707070",
            cursor: pendingVariantKeys.length > 0 ? "pointer" : "not-allowed",
            letterSpacing: "0.1em",
          }}
        >
          INSERISCI IN SCENA
        </button>
      </div>
    </div>
  );

  const renderBuilderScreen = () => {
    const togglePanel = (panelName) => {
      setExpandedPanel(prev => prev === panelName ? null : panelName);
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#EEEEEE",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top Section */}
        <div
          style={{
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => {
              const existingKeys =
                chairs.length > 0
                  ? deriveVariantKeysFromChairs()
                  : sortVariantKeys(
                    [
                      getVariantKeyFromModelPath(selectedSofa?.modelPath),
                    ].filter(Boolean)
                  );
              setPendingVariantKeys(existingKeys);
              setStage(STAGES.selection);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #666",
              background: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              color: "#333",
            }}
          >
            Go to Compositions
          </button>

          {/* Product Title */}
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "400",
              letterSpacing: "0.3em",
              margin: 0,
              color: "#333",
            }}
          >
            JUMP SOFA
          </h1>

          {/* Empty space for balance */}
          <div style={{ width: "150px" }} />
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            position: "relative",
          }}
        >
          {/* Left Sidebar - Control Icons */}
          <div
            style={{
              width: "60px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "20px 10px",
              alignItems: "center",
            }}
          >
            {/* 2D View Button */}
            <button
              onClick={() => setViewMode("2d")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid #666",
                background: viewMode === "2d" ? "#333" : "#fff",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: viewMode === "2d" ? "#fff" : "#333",
                transition: "all 0.2s",
              }}
              title="2D View"
            >
              2D
            </button>

            {/* 3D View Button */}
            <button
              onClick={() => setViewMode("3d")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid #666",
                background: viewMode === "3d" ? "#333" : "#fff",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: viewMode === "3d" ? "#fff" : "#333",
                transition: "all 0.2s",
              }}
              title="3D View"
            >
              3D
            </button>

            {/* Placeholder for rotation icon */}
            <button
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid #666",
                background: viewMode === "3d" ? "#333" : "#fff",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: viewMode === "3d" ? "#fff" : "#333",
              }}
              title="Orbit control"
            >
              ↻
            </button>

          </div>

          {/* Center - 3D Canvas */}
          <div
            ref={canvasContainerRef}
            className="canvas-container"
            style={{
              flex: 1,
              position: "relative",
              margin: "0 20px",
            }}
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
                  const resolvedPosition = getResolvedPosition(chair);
                  return (
                    <DraggableModule
                      key={chair.id}
                      position={resolvedPosition}
                      disabled={
                        viewMode !== "2d" || rotationTargetId === chair.id
                      }
                      onDragStart={() => handleDragStart(chair)}
                      onDrag={(pos) => handleDragMove(chair, pos)}
                      onDragEnd={(finalPos) => handleDragEnd(chair, finalPos)}
                      onSelect={(event) => handleSelectChair(chair, event)}
                    >
                      <group
                        rotation={[
                          0,
                          viewMode === "3d" ? chair.rotation || 0 : 0,
                          0,
                        ]}
                      >
                        <Model
                          modelPath={chair.sofa.modelPath}
                          chairTexturePath={
                            chair.chairTexture || selectedChairTexture
                          }
                          pillowTexturePath={
                            chair.pillowTexture || selectedPillowTexture
                          }
                          feetTexturePath={
                            chair.feetTexture || selectedFeetTexture
                          }
                          position={[0, 0, 0]}
                        />
                      </group>
                    </DraggableModule>
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
              {snapPreview && viewMode === "2d" && (
                <group>
                  <Line
                    points={[
                      [
                        snapPreview.neighborPosition[0],
                        0.05,
                        snapPreview.neighborPosition[2],
                      ],
                      [
                        snapPreview.snappedPosition[0],
                        0.05,
                        snapPreview.snappedPosition[2],
                      ],
                    ]}
                    color="#222222"
                    lineWidth={1}
                    dashed
                    dashSize={0.2}
                    gapSize={0.12}
                  />
                  <mesh
                    position={[
                      snapPreview.snappedPosition[0],
                      0.01,
                      snapPreview.snappedPosition[2],
                    ]}
                  >
                    <boxGeometry
                      args={[
                        (snapPreview.draggedWidth ?? CHAIR_WIDTH) * 0.9,
                        0.005,
                        (snapPreview.draggedWidth ?? CHAIR_WIDTH) * 0.6,
                      ]}
                    />
                    <meshStandardMaterial
                      color="#111111"
                      transparent
                      opacity={0.15}
                    />
                  </mesh>
                </group>
              )}
              {rotationTarget && viewMode === "2d" && (
                <RotationRing
                  position={getResolvedPosition(rotationTarget)}
                  angle={((rotationTarget.rotation || 0) * 180) / Math.PI}
                  onRotate={(deg) => handleRotateChange(rotationTarget.id, deg)}
                  onClose={() => setRotationTargetId(null)}
                />
              )}
              <CameraManager viewMode={viewMode} isDragging={isDragging2D} />
              <Environment preset="apartment" />
            </Canvas>

            {/* Action Panel for selected module in 2D mode */}
            {showActionPanel && selectedChair && viewMode === "2d" && (
              <div
                data-selection-menu
                style={{
                  position: "absolute",
                  ...getActionPanelStyle(),
                  background: "#fff",
                  border: "2px solid #1b1b1b",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 100,
                }}
              >
                <div style={{ marginBottom: "12px", fontWeight: "600" }}>
                  {selectedChair.sofa.name}
                </div>
                <button
                  onClick={handleRotateRequest}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Rotate Module
                </button>
                <button
                  onClick={() => {
                    handleRemoveChair(selectedChair.id);
                    setShowActionPanel(false);
                    setSelectedChairId(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    cursor: "pointer",
                    color: "#c00",
                  }}
                >
                  Remove Module
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Accordion Panels */}
          <div
            style={{
              width: "320px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* ADD MODULE Panel */}
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              <button
                onClick={() => togglePanel("addModule")}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#333",
                }}
              >
                <span>ADD MODULE</span>
                <span style={{ fontSize: "18px" }}>
                  {expandedPanel === "addModule" ? "−" : "+"}
                </span>
              </button>
              {expandedPanel === "addModule" && (
                <div
                  data-module-menu
                  style={{
                    padding: "0 16px 16px 16px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
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
                        onClick={() => {
                          handleAddChair(module);
                          setExpandedPanel(null);
                        }}
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

            {/* MATERIALS Panel */}
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              <button
                onClick={() => togglePanel("materials")}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#333",
                }}
              >
                <span>MATERIALS</span>
                <span style={{ fontSize: "18px" }}>
                  {expandedPanel === "materials" ? "−" : "+"}
                </span>
              </button>
              {expandedPanel === "materials" && (
                <div
                  style={{
                    padding: "0 16px 16px 16px",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                >
                  {isDetectingParts ? (
                    <div style={{ fontSize: "12px", color: "#666", padding: "10px" }}>
                      Caricamento...
                    </div>
                  ) : colorSelectors.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#666", padding: "10px" }}>
                      Nessuna parte disponibile
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {colorSelectors.map((selector) => (
                        <Palette
                          key={selector.label}
                          label={selector.label}
                          options={selector.options}
                          selectedOptionId={selector.selectedOptionId}
                          onSelect={selector.onSelect}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COMPOSITION LIST Panel */}
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              <button
                onClick={() => togglePanel("composition")}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#333",
                }}
              >
                <span>COMPOSITION LIST</span>
                <span style={{ fontSize: "18px" }}>
                  {expandedPanel === "composition" ? "−" : "+"}
                </span>
              </button>
              {expandedPanel === "composition" && (
                <div
                  style={{
                    padding: "0 16px 16px 16px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {chairs.length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#666", padding: "10px" }}>
                      No modules added yet
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {chairs.map((chair, index) => (
                        <div
                          key={chair.id}
                          style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #e0e0e0",
                            background: "#fafafa",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "500" }}>
                              {chair.sofa.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#666" }}>
                              {chair.sofa.description}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveChair(chair.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "1px solid #c00",
                              background: "#fff",
                              color: "#c00",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            padding: "16px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #ddd",
            background: "#fff",
          }}
        >
          {/* Left - Branding and controls */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "#999" }}>spagnol</span>
            <div style={{ display: "flex", gap: "10px" }}>


              <button
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
                title="Dimensions"
              >
                📐
              </button>
              <button
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
                title="Copy/Export"
              >
                📋
              </button>
            </div>
          </div>

          {/* Right - Request Info Button */}
          <button
            style={{
              padding: "12px 32px",
              borderRadius: "4px",
              border: "none",
              background: "#1a1a1a",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.05em",
            }}
          >
            REQUEST INFO
          </button>
        </div>
      </div>
    );
  };

  if (stage === STAGES.landing) return renderLandingScreen();
  if (stage === STAGES.selection) return renderSelectionScreen();
  return renderBuilderScreen();
}
