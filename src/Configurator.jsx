import { useState, useMemo, useEffect, useRef } from "react";
import { detectPartsFromModel } from "./utils/detectParts";
import {
  STAGES,
  upholsteryTextures,
  feetTextures,
  sofaCatalog,
} from "./constants";
import {
  getVariantKeyFromModelPath,
  sortVariantKeys,
  deriveVariantKeysFromChairs,
  getModuleWidth,
  getItemImagePath,
  getResolvedPosition,
  findSnapTarget,
  findAttachableNeighbors,
  shouldDetach,
  recalculateGroupPositions,
  createGroupId,
} from "./utils/configurator";
import LandingScreen from "./components/screens/LandingScreen";
import SelectionScreen from "./components/screens/SelectionScreen";
import BuilderScreen from "./components/screens/BuilderScreen";

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

  const [draggingChairId, setDraggingChairId] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [rotationTargetId, setRotationTargetId] = useState(null);
  const [isDragging2D, setIsDragging2D] = useState(false);
  const canvasContainerRef = useRef(null);

  // State for right sidebar accordion panels
  const [expandedPanel, setExpandedPanel] = useState(null);

  // State for material selection mode
  const [materialTargetMode, setMaterialTargetMode] = useState("all"); // "single" | "all"
  const [materialTargetChairId, setMaterialTargetChairId] = useState(null);

  const CHAIR_WIDTH = 1.14;

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

  const handleDragStart = (chair) => {
    if (viewMode !== "2d") return;
    setDraggingChairId(chair.id);
    setDragPosition(null);
    setIsDragging2D(true);
    setShowActionPanel(false);
    setRotationTargetId(null);
    setSnapPreview(null);
  };

  const handleDragMove = (chair, pos) => {
    if (viewMode !== "2d") return;
    
    // Track drag position for snap zone calculation
    setDragPosition(pos);
    
    // Only update the dragged chair's position (no group dragging)
    setChairs((prev) =>
      prev.map((c) =>
        c.id === chair.id ? { ...c, customPosition: [pos.x, 0, pos.z] } : c
      )
    );
    
    // Update snap preview
    const snap = findSnapTarget(chair, pos, chairs, autoPositions);
    setSnapPreview(snap);
  };

  const handleDragEnd = (chair, pos) => {
    if (viewMode !== "2d") return;
    setDraggingChairId(null);
    setDragPosition(null);
    setIsDragging2D(false);
    
    // Check for attach
    const attachable = findAttachableNeighbors(chair, pos, chairs, autoPositions);
    const shouldAttach = attachable.length > 0;
    
    let targetPosition = [pos.x, 0, pos.z];
    let newGroupId = chair.groupId;
    let detachFromGroup = false;
    
    if (shouldAttach) {
      // Attach to the nearest neighbor
      const nearest = attachable[0];
      targetPosition = nearest.snappedPosition;
      
      if (nearest.attachToGroup) {
        // Join existing group
        newGroupId = nearest.attachToGroup;
      } else {
        // Create new group with both chairs
        newGroupId = createGroupId();
      }
    } else if (chair.groupId) {
      // Not attaching to anything - check if should detach
      detachFromGroup = shouldDetach(chair, pos, chairs, autoPositions);
    }
    
    setSnapPreview(null);
    
    setChairs((prev) => {
      return prev.map((c) => {
        if (c.id === chair.id) {
          return {
            ...c,
            customPosition: targetPosition,
            groupId: newGroupId,
          };
        }
        if (shouldAttach && newGroupId && attachable[0] && c.id === attachable[0].chair.id) {
          // Add the neighbor to the same group
          return {
            ...c,
            groupId: newGroupId,
          };
        }
        if (detachFromGroup && c.groupId === chair.groupId && c.id !== chair.id) {
          // Detach all group members except the dragged one
          return {
            ...c,
            groupId: null,
          };
        }
        return c;
      });
    });
  };

  const handleSelectChair = (chair, event) => {
    if (viewMode !== "2d" || draggingChairId) return;
    event.stopPropagation();
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
    if (chairId === null) {
      setRotationTargetId(null);
      return;
    }
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
          // Only update global state when in "all" mode
          if (materialTargetMode === "all") {
            setSelectedChairOptionId(option.id);
            setSelectedChairTexture(option.path);
          }
          // Apply texture based on mode
          setChairs((prev) =>
            prev.map((chair) => {
              // If in "single" mode, only update the target chair
              if (materialTargetMode === "single" && chair.id !== materialTargetChairId) {
                return chair;
              }
              // Otherwise update all chairs
              return {
                ...chair,
                chairTexture: option.path,
              };
            })
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
          // Only update global state when in "all" mode
          if (materialTargetMode === "all") {
            setSelectedPillowOptionId(option.id);
            setSelectedPillowTexture(option.path);
          }
          // Apply texture based on mode
          setChairs((prev) =>
            prev.map((chair) => {
              // If in "single" mode, only update the target chair
              if (materialTargetMode === "single" && chair.id !== materialTargetChairId) {
                return chair;
              }
              // Otherwise update all chairs
              return {
                ...chair,
                pillowTexture: option.path,
              };
            })
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
          // Only update global state when in "all" mode
          if (materialTargetMode === "all") {
            setSelectedFeetOptionId(option.id);
            setSelectedFeetTexture(option.path);
          }
          // Apply texture based on mode
          setChairs((prev) =>
            prev.map((chair) => {
              // If in "single" mode, only update the target chair
              if (materialTargetMode === "single" && chair.id !== materialTargetChairId) {
                return chair;
              }
              // Otherwise update all chairs
              return {
                ...chair,
                feetTexture: option.path,
              };
            })
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
    materialTargetMode,
    materialTargetChairId,
  ]);

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

  const handleDetach = (chair) => {
    if (!chair.groupId) return; // Already detached
    
    // Detach this chair from its group
    setChairs((prev) =>
      prev.map((c) =>
        c.id === chair.id ? { ...c, groupId: null } : c
      )
    );
  };

  const handleBackToSelection = () => {
    const existingKeys =
      chairs.length > 0
        ? deriveVariantKeysFromChairs(chairs)
        : sortVariantKeys(
          [getVariantKeyFromModelPath(selectedSofa?.modelPath)].filter(
            Boolean
          )
        );
    setPendingVariantKeys(existingKeys);
    setStage(STAGES.selection);
  };

  // Render appropriate screen based on stage
  if (stage === STAGES.landing) {
    return <LandingScreen onLaunch={handleLaunchConfigurator} />;
  }

  if (stage === STAGES.selection) {
    return (
      <SelectionScreen
        pendingVariantKeys={pendingVariantKeys}
        setPendingVariantKeys={setPendingVariantKeys}
        onBack={() => setStage(STAGES.landing)}
        onConfirm={handleConfirmSelection}
        sofaCatalog={sofaCatalog}
        getItemImagePath={getItemImagePath}
      />
    );
  }

  return (
    <BuilderScreen
      // State
      chairs={chairs}
      viewMode={viewMode}
      selectedSofa={selectedSofa}
      selectedChairTexture={selectedChairTexture}
      selectedPillowTexture={selectedPillowTexture}
      selectedFeetTexture={selectedFeetTexture}
      expandedPanel={expandedPanel}
      snapPreview={snapPreview}
      selectedChair={selectedChair}
      rotationTarget={rotationTarget}
      showActionPanel={showActionPanel}
      canvasContainerRef={canvasContainerRef}
      isDragging2D={isDragging2D}
      rotationTargetId={rotationTargetId}
      availableModules={availableModules}
      colorSelectors={colorSelectors}
      isDetectingParts={isDetectingParts}
      dragPosition={dragPosition}
      // Setters
      setViewMode={setViewMode}
      setExpandedPanel={setExpandedPanel}
      setShowActionPanel={setShowActionPanel}
      setSelectedChairId={setSelectedChairId}
      setMaterialTargetMode={setMaterialTargetMode}
      setMaterialTargetChairId={setMaterialTargetChairId}
      // Handlers
      onBackToSelection={handleBackToSelection}
      handleDragStart={handleDragStart}
      handleDragMove={handleDragMove}
      handleDragEnd={handleDragEnd}
      handleSelectChair={handleSelectChair}
      handleDetach={handleDetach}
      handleRotateRequest={handleRotateRequest}
      handleRotateChange={handleRotateChange}
      handleAddChair={handleAddChair}
      handleRemoveChair={handleRemoveChair}
      getResolvedPosition={(chair) => getResolvedPosition(chair, autoPositions)}
    />
  );
}
