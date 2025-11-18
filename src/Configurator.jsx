import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Line, Html } from "@react-three/drei";
import Model from "./Model";
import Palette from "./Palette";
import { useState, useMemo, useEffect, useRef } from "react";
import { detectPartsFromModel } from "./utils/detectParts";
import DraggableModule from "./DraggableModule";
import {
  STAGES,
  upholsteryTextures,
  feetTextures,
  SOFA_FAMILY_NAME,
  sofaCatalog,
  VARIANT_CONFIG,
} from "./constants";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggingChairId, setDraggingChairId] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [actionPanelPos, setActionPanelPos] = useState({ x: 0, y: 0 });
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [rotationTargetId, setRotationTargetId] = useState(null);
  const [isDragging2D, setIsDragging2D] = useState(false);
  const canvasContainerRef = useRef(null);

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

  const findSnapTarget = (chair, pos) => {
    let nearest = null;
    let nearestDist = Infinity;
    chairs.forEach((chair) => {
      if (chair.id === chairId) return;
      const chairPos = getResolvedPosition(chair);
      const dx = chairPos[0] - pos.x;
      const dz = chairPos[2] - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = chair;
      }
    });
    if (!nearest || nearestDist >= SNAP_DISTANCE) return null;
    const neighborPos = getResolvedPosition(nearest);
    const direction = pos.x < neighborPos[0] ? -1 : 1;
    const neighborWidth = getModuleWidth(nearest);
    const draggedWidth = getModuleWidth(chair);
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
        customPosition: null,
        rotation: 0,
      },
    ]);
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
            {viewMode === "3d" ? (
              <OrbitControls
                enableRotate={true}
                enableZoom={true}
                enablePan={true}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
              />
            ) : (
              <OrbitControls
                enablePan={!isDragging2D}
                enableRotate={false}
                enableZoom={!isDragging2D}
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

            <button
              onClick={handleRemoveLastChair}
              disabled={chairs.length === 0}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "2px solid #1b1b1b",
                background: chairs.length === 0 ? "#f0f0f0" : "#fff",
                color: chairs.length === 0 ? "#9c9c9c" : "#1b1b1b",
                cursor: chairs.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ fontSize: "18px" }}>−</span>
              <span>Rimuovi modulo</span>
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
