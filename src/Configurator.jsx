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
  getActualModuleWidth,
  getProjectedHalfWidth,
  getSnapSpacing,
  getItemImagePath,
  getResolvedPosition,
  findSnapTarget,
  findAttachableNeighbors,
  shouldDetach,
  calculateCompositionDimensions,
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

  const [chairs, setChairs] = useState([]);
  const [showModuleMenu, setShowModuleMenu] = useState(false);
  const [viewMode, setViewMode] = useState("3d");

  const [draggingChairId, setDraggingChairId] = useState(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const dragPositionRef = useRef(null); // Ref to track current drag position
  const [selectedChairId, setSelectedChairId] = useState(null);
  const selectedChairIdRef = useRef(null); // Ref for immediate access
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [rotationTargetId, setRotationTargetId] = useState(null);
  const [isDragging2D, setIsDragging2D] = useState(false);
  const canvasContainerRef = useRef(null);
  const [focusedChairId, setFocusedChairId] = useState(null);

  const [expandedPanel, setExpandedPanel] = useState(null);
  const [materialTargetMode, setMaterialTargetMode] = useState("all");
  const [materialTargetChairId, setMaterialTargetChairId] = useState(null);

  const autoPositions = useMemo(() => {
    const positionsMap = new Map();
    const SPACING = 0.2; // 20cm spacing between auto-placed modules

    // Include ALL chairs in the calculation to maintain stable slots,
    // even if some are currently being dragged (have customPosition).
    const leftChairs = chairs.filter((c) => c.position === "left");
    const centerChairs = chairs.filter((c) => c.position === "center");
    const rightChairs = chairs.filter((c) => c.position === "right");

    let leftOffset = 0;
    for (let i = leftChairs.length - 1; i >= 0; i -= 1) {
      const chair = leftChairs[i];
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [-(leftOffset + half), 0, 0]);
      leftOffset += (width + SPACING);
    }

    let centerOffset = 0;
    centerChairs.forEach((chair) => {
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [centerOffset + half, 0, 0]);
      centerOffset += (width + SPACING);
    });

    let rightCursor = centerOffset > 0 ? centerOffset : 0;
    rightChairs.forEach((chair) => {
      const width = getModuleWidth(chair);
      const half = width / 2;
      positionsMap.set(chair.id, [rightCursor + half, 0, 0]);
      rightCursor += (width + SPACING);
    });

    // Calculate centering offset
    // The range is [-leftOffset, rightCursor]
    // Note: leftOffset includes the last spacing which extends beyond the last chair,
    // but for centering calculation it's close enough or we can adjust if strict precision needed.
    // Technically bounds are:
    // Min: -(leftOffset - SPACING) if leftChairs > 0
    // Max: (rightCursor - SPACING) if rightChairs > 0

    // Simple centering based on the computed cursors is usually fine for visual balance.
    const totalMinX = -leftOffset;
    const totalMaxX = rightCursor;
    const midpoint = (totalMinX + totalMaxX) / 2;

    // Apply offset to all positions to center the group
    if (midpoint !== 0) {
      for (const [id, pos] of positionsMap) {
        positionsMap.set(id, [pos[0] - midpoint, pos[1], pos[2]]);
      }
    }

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
    // Ensure the chair is focused (highlighted) when dragging starts
    setFocusedChairId(chair.id);
  };

  const handleDragMove = (chair, pos) => {
    if (viewMode !== "2d") return;
    setDragPosition(pos);

    // Update customPosition for the dragged chair
    const updatedChairs = chairs.map((c) =>
      c.id === chair.id ? { ...c, customPosition: [pos.x, 0, pos.z] } : c
    );
    setChairs(updatedChairs);

    // Build a current position map that includes:
    // - customPositions for all chairs
    // - autoPositions for chairs without customPosition
    // - the dragged chair's new position
    const currentPositions = new Map();
    chairs.forEach((c) => {
      if (c.id === chair.id) {
        // Use the new position for the dragged chair
        currentPositions.set(c.id, [pos.x, 0, pos.z]);
      } else if (c.customPosition) {
        currentPositions.set(c.id, c.customPosition);
      } else {
        const autoPos = autoPositions.get(c.id);
        if (autoPos) {
          currentPositions.set(c.id, autoPos);
        }
      }
    });

    const snap = findSnapTarget(chair, pos, updatedChairs, currentPositions);
    setSnapPreview(snap);
  };

  const handleDragEnd = (chair, pos) => {
    if (viewMode !== "2d") return;
    setDraggingChairId(null);
    setDragPosition(null);
    setIsDragging2D(false);

    // Build a current position map
    const currentPositions = new Map();
    chairs.forEach((c) => {
      if (c.id === chair.id) {
        currentPositions.set(c.id, [pos.x, 0, pos.z]);
      } else if (c.customPosition) {
        currentPositions.set(c.id, c.customPosition);
      } else {
        const autoPos = autoPositions.get(c.id);
        if (autoPos) {
          currentPositions.set(c.id, autoPos);
        }
      }
    });

    const attachable = findAttachableNeighbors(
      chair,
      pos,
      chairs,
      currentPositions
    );
    const shouldAttach = attachable.length > 0;

    // FIX: actually use shouldDetach to detach when dragged far from the group
    const detach = !shouldAttach && shouldDetach(chair, pos, chairs, currentPositions);

    let targetPosition = [pos.x, 0, pos.z];
    let newGroupId = chair.groupId;
    let saveOriginalGroupId = chair.originalGroupId;

    if (shouldAttach) {
      const nearest = attachable[0];
      targetPosition = nearest.snappedPosition;
      if (nearest.attachToGroup) {
        newGroupId = nearest.attachToGroup;
      } else {
        newGroupId = createGroupId();
      }
    } else if (detach) {
      // Detach: save original group so re-attach is possible later
      saveOriginalGroupId = chair.groupId;
      newGroupId = createGroupId();
    } else if (!chair.groupId && saveOriginalGroupId) {
      // Check if near original group members to re-attach
      const originalGroupMembers = chairs.filter(
        (c) => c.groupId === saveOriginalGroupId
      );
      for (const member of originalGroupMembers) {
        const memberPos = getResolvedPosition(member, currentPositions);
        const dx = memberPos[0] - pos.x;
        const dz = memberPos[2] - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.5) {
          newGroupId = saveOriginalGroupId;
          const draggedIsLeft = pos.x < memberPos[0];
          const direction = draggedIsLeft ? -1 : 1;
          const spacing = getSnapSpacing(chair, member, draggedIsLeft);
          targetPosition = [
            memberPos[0] + direction * spacing,
            0,
            memberPos[2],
          ];
          saveOriginalGroupId = null;
          break;
        }
      }
    }

    setSnapPreview(null);

    setChairs((prev) =>
      prev.map((c) => {
        if (c.id === chair.id) {
          return {
            ...c,
            customPosition: targetPosition,
            groupId: newGroupId,
            originalGroupId: saveOriginalGroupId,
          };
        }
        return c;
      })
    );
  };

  const handleSelectChair = (chair, event) => {
    if (viewMode !== "2d" || draggingChairId) return;
    event.stopPropagation();

    // Always select and show menu on first click
    setFocusedChairId(chair.id);
    setSelectedChairId(chair.id);
    selectedChairIdRef.current = chair.id;
    setShowActionPanel(true);

    setRotationTargetId(null);
  };

  const handleDoubleClick = (chair, event) => {
    if (viewMode !== "2d") return;
    event.stopPropagation();

    // Detach the chair from its group if it has one
    // Store originalGroupId so we can re-attach later
    // Create a new group for the detached chair so the original group stays intact
    if (chair.groupId) {
      setChairs((prev) =>
        prev.map((c) =>
          c.id === chair.id
            ? {
              ...c,
              customPosition: null,
              groupId: createGroupId(),
              originalGroupId: chair.groupId,
            }
            : c
        )
      );
    }
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

  const handleCanvasMissed = () => {
    setFocusedChairId(null);
    setSelectedChairId(null);
    setShowActionPanel(false);
    setRotationTargetId(null);
  };

  const selectedChair =
    chairs.find((chair) => chair.id === selectedChairId) ?? null;
  const rotationTarget =
    chairs.find((chair) => chair.id === rotationTargetId) ?? null;

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
          setDetectedParts(["chair", "pillow", "feet"]);
          setIsDetectingParts(false);
        });
    } else {
      setDetectedParts([]);
    }
  }, [selectedSofa?.modelPath]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModuleMenu && !event.target.closest("[data-module-menu]")) {
        setShowModuleMenu(false);
      }
    };
    if (showModuleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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

  // Keep ref in sync with state
  useEffect(() => {
    selectedChairIdRef.current = selectedChairId;
  }, [selectedChairId]);

  const availableParts = detectedParts.length > 0 ? detectedParts : [];
  const colorSelectors = useMemo(() => {
    const selectors = [];
    if (availableParts.includes("chair")) {
      selectors.push({
        label: "CHAIR",
        options: upholsteryTextures,
        selectedOptionId: selectedChairOptionId,
        onSelect: (option) => {
          if (materialTargetMode === "all") {
            setSelectedChairOptionId(option.id);
            setSelectedChairTexture(option.path);
          }
          setChairs((prev) =>
            prev.map((chair) => {
              if (
                materialTargetMode === "single" &&
                chair.id !== materialTargetChairId
              )
                return chair;
              return { ...chair, chairTexture: option.path };
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
          if (materialTargetMode === "all") {
            setSelectedPillowOptionId(option.id);
            setSelectedPillowTexture(option.path);
          }
          setChairs((prev) =>
            prev.map((chair) => {
              if (
                materialTargetMode === "single" &&
                chair.id !== materialTargetChairId
              )
                return chair;
              return { ...chair, pillowTexture: option.path };
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
          if (materialTargetMode === "all") {
            setSelectedFeetOptionId(option.id);
            setSelectedFeetTexture(option.path);
          }
          setChairs((prev) =>
            prev.map((chair) => {
              if (
                materialTargetMode === "single" &&
                chair.id !== materialTargetChairId
              )
                return chair;
              return { ...chair, feetTexture: option.path };
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

    // Calculate new position based on all existing chairs (including disjoint groups)
    const groups = calculateCompositionDimensions(chairs, (c) => getResolvedPosition(c, autoPositions));

    // Find the global max X (rightmost edge) across all groups
    let maxX = 0;
    if (groups && groups.length > 0) {
      // Initialize with correct min to ensure we find real max
      maxX = -Infinity;
      groups.forEach(g => {
        if (g.bbox.max.x > maxX) maxX = g.bbox.max.x;
      });
    } else {
      // If no chairs, start at 0
      maxX = 0;
    }

    // New chair width
    // We need to create a temp chair object to get width, or look it up
    const tempChair = { sofa };
    const width = getModuleWidth(tempChair);
    const half = width / 2;

    // Place strictly to the right of the entire scene
    // If scene is empty (maxX=0), place at 0 (center of module)
    // If scene exists, place at maxX + spacing + halfWidth
    const newX = (chairs.length > 0) ? (maxX + 0.2 + half) : 0;

    const newChair = {
      id: Date.now(),
      sofa,
      chairTexture: selectedChairTexture,
      pillowTexture: selectedPillowTexture,
      feetTexture: selectedFeetTexture,
      position: "right", // Legacy metadata
      customPosition: [newX, 0, 0], // Strict explicit position
      rotation: 0,
      groupId: createGroupId(), // Start as separate group
    };
    setChairs((prev) => [...prev, newChair]);
    setShowModuleMenu(false);
  };

  const availableModules = sofaCatalog.flatMap((cat) => cat.items);

  const handleRemoveChair = (chairId) => {
    setChairs((prev) => prev.filter((chair) => chair.id !== chairId));
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
      chairs={chairs}
      viewMode={viewMode}
      selectedSofa={selectedSofa}
      selectedChairTexture={selectedChairTexture}
      selectedPillowTexture={selectedPillowTexture}
      selectedFeetTexture={selectedFeetTexture}
      expandedPanel={expandedPanel}
      snapPreview={snapPreview}
      selectedChair={selectedChair}
      selectedChairId={selectedChairId}
      rotationTarget={rotationTarget}
      showActionPanel={showActionPanel}
      canvasContainerRef={canvasContainerRef}
      isDragging2D={isDragging2D}
      rotationTargetId={rotationTargetId}
      availableModules={availableModules}
      colorSelectors={colorSelectors}
      isDetectingParts={isDetectingParts}
      dragPosition={dragPosition}
      setViewMode={setViewMode}
      setExpandedPanel={setExpandedPanel}
      setShowActionPanel={setShowActionPanel}
      setSelectedChairId={setSelectedChairId}
      setMaterialTargetMode={setMaterialTargetMode}
      setMaterialTargetChairId={setMaterialTargetChairId}
      focusedChairId={focusedChairId}
      setFocusedChairId={setFocusedChairId}
      onBackToSelection={handleBackToSelection}
      handleDragStart={handleDragStart}
      handleDragMove={handleDragMove}
      handleDragEnd={handleDragEnd}
      handleSelectChair={handleSelectChair}
      handleDoubleClick={handleDoubleClick}
      handleRotateRequest={handleRotateRequest}
      handleRotateChange={handleRotateChange}
      handleAddChair={handleAddChair}
      handleRemoveChair={handleRemoveChair}
      getResolvedPosition={(chair) => getResolvedPosition(chair, autoPositions)}
      onEmptyClick={handleCanvasMissed}
    />
  );
}
