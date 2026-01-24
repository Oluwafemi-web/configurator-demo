import React from "react";
import Palette from "../../Palette";
import PDFExport from "../PDFExport";
import ExportImage from "../ExportImage";
import Export3D from "../Export3D";
import ModuleActionModal from "../ModuleActionModal";
import Canvas2DView from "../canvas/Canvas2DView";
import Canvas3DView from "../canvas/Canvas3DView";

const CHAIR_WIDTH = 1.14;

/**
 * BuilderScreen Component
 * Main 3D builder interface with canvas, sidebars, and controls
 */
export default function BuilderScreen({
    // State
    chairs,
    viewMode,
    selectedSofa,
    selectedChairTexture,
    selectedPillowTexture,
    selectedFeetTexture,
    expandedPanel,
    snapPreview,
    selectedChair,
    rotationTarget,
    showActionPanel,
    canvasContainerRef,
    isDragging2D,
    rotationTargetId,
    availableModules,
    colorSelectors,
    isDetectingParts,

    // Setters
    setViewMode,
    setExpandedPanel,
    setShowActionPanel,
    setSelectedChairId,
    setMaterialTargetMode,
    setMaterialTargetChairId,

    // Handlers
    onBackToSelection,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleSelectChair,
    handleRotateRequest,
    handleRotateChange,
    handleAddChair,
    handleRemoveChair,
    getResolvedPosition,
}) {
    const [showDimensions, setShowDimensions] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);

    const togglePanel = (panelName) => {
        setExpandedPanel((prev) => (prev === panelName ? null : panelName));
    };

    // Auto-hide dimensions when switching from 3D to 2D view
    React.useEffect(() => {
        if (viewMode === "2d" && showDimensions) {
            setShowDimensions(false);
        }
    }, [viewMode]);

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
                    onClick={onBackToSelection}
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
                    {/* <button
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
                    </button> */}
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
                    {viewMode === "2d" ? (
                        <Canvas2DView
                            chairs={chairs}
                            selectedChairTexture={selectedChairTexture}
                            selectedPillowTexture={selectedPillowTexture}
                            selectedFeetTexture={selectedFeetTexture}
                            snapPreview={snapPreview}
                            rotationTarget={rotationTarget}
                            isDragging2D={isDragging2D}
                            canvasContainerRef={canvasContainerRef}
                            handleDragStart={handleDragStart}
                            handleDragMove={handleDragMove}
                            handleDragEnd={handleDragEnd}
                            handleSelectChair={handleSelectChair}
                            handleRotateChange={handleRotateChange}
                            getResolvedPosition={getResolvedPosition}
                            rotationTargetId={rotationTargetId}
                            showDimensions={showDimensions && !isExporting}
                        />
                    ) : (
                        <Canvas3DView
                            chairs={chairs}
                            selectedChairTexture={selectedChairTexture}
                            selectedPillowTexture={selectedPillowTexture}
                            selectedFeetTexture={selectedFeetTexture}
                            canvasContainerRef={canvasContainerRef}
                            getResolvedPosition={getResolvedPosition}
                            showDimensions={showDimensions && !isExporting}
                        />
                    )}

                    {/* Action Modal for selected module in 2D mode */}
                    {showActionPanel && selectedChair && viewMode === "2d" && (
                        <ModuleActionModal
                            selectedChair={selectedChair}
                            onClose={() => {
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                            }}
                            onRotate={() => {
                                handleRotateRequest();
                            }}
                            onDuplicate={() => {
                                handleAddChair(selectedChair.sofa);
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                            }}
                            onDelete={() => {
                                handleRemoveChair(selectedChair.id);
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                            }}
                            onAddModules={() => {
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                                setExpandedPanel("addModule");
                            }}
                            onChangeMaterialModule={() => {
                                // Set mode to single module and store the selected chair ID
                                setMaterialTargetMode("single");
                                setMaterialTargetChairId(selectedChair.id);
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                                setExpandedPanel("materials");
                            }}
                            onChangeMaterialComposition={() => {
                                // Set mode to all modules
                                setMaterialTargetMode("all");
                                setMaterialTargetChairId(null);
                                setShowActionPanel(false);
                                setSelectedChairId(null);
                                setExpandedPanel("materials");
                            }}
                        />
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
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#666",
                                            padding: "10px",
                                        }}
                                    >
                                        Caricamento...
                                    </div>
                                ) : colorSelectors.length === 0 ? (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#666",
                                            padding: "10px",
                                        }}
                                    >
                                        Nessuna parte disponibile
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "24px",
                                        }}
                                    >
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
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#666",
                                            padding: "10px",
                                        }}
                                    >
                                        No modules added yet
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {chairs.map((chair) => (
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
                                                    <div
                                                        style={{ fontSize: "13px", fontWeight: "500" }}
                                                    >
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
                            onClick={() => setShowDimensions(!showDimensions)}
                            style={{
                                padding: "6px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                background: showDimensions ? "#333" : "#fff",
                                color: showDimensions ? "#fff" : "#000",
                                cursor: "pointer",
                                fontSize: "11px",
                                transition: "all 0.2s",
                            }}
                            title="Dimensions"
                        >
                            📐
                        </button>
                        <PDFExport
                            canvasRef={canvasContainerRef}
                            modules={chairs}
                            selectedFabric={selectedChairTexture}
                            setIsExporting={setIsExporting}
                            getResolvedPosition={getResolvedPosition}
                        />
                        <ExportImage canvasRef={canvasContainerRef} />
                        <Export3D modules={chairs} />
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
}
