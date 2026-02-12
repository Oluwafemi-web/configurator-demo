import React from "react";
import Palette from "../../Palette";
import PDFExport from "../PDFExport";
import ExportImage from "../ExportImage";
import Export3D from "../Export3D";
import ModuleActionModal from "../ModuleActionModal";
import Canvas2DView from "../canvas/Canvas2DView";
import Canvas3DView from "../canvas/Canvas3DView";
import ZoomControls from "../ZoomControls";
import SnapIndicator from "../SnapIndicator";

const CHAIR_WIDTH = 1.14;

export default function BuilderScreen({
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
    draggingChairId,
    dragPosition,
    availableModules,
    colorSelectors,
    isDetectingParts,
    setViewMode,
    setExpandedPanel,
    setShowActionPanel,
    setSelectedChairId,
    setMaterialTargetMode,
    setMaterialTargetChairId,
    onBackToSelection,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleSelectChair,
    handleDoubleClick,
    handleRotateRequest,
    handleRotateChange,
    handleAddChair,
    handleRemoveChair,
    getResolvedPosition,
}) {
    const [showDimensions, setShowDimensions] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const [zoom, setZoom] = React.useState(100);

    const togglePanel = (panelName) => {
        setExpandedPanel((prev) => (prev === panelName ? null : panelName));
    };

    React.useEffect(() => {
        if (viewMode === "2d" && showDimensions) {
            setShowDimensions(false);
        }
    }, [viewMode]);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#EEEEEE", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={onBackToSelection} style={{ padding: "8px 16px", borderRadius: "4px", border: "1px solid #666", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#333" }}>
                    Go to Compositions
                </button>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "400", letterSpacing: "0.3em", margin: 0, color: "#333" }}>JUMP SOFA</h1>
            </div>

            <div style={{ flex: 1, display: "flex", position: "relative" }}>
                <div style={{ width: "60px", display: "flex", flexDirection: "column", gap: "12px", padding: "20px 10px", alignItems: "center" }}>
                    <button onClick={() => setViewMode("2d")} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #666", background: viewMode === "2d" ? "#333" : "#fff", cursor: "pointer", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", color: viewMode === "2d" ? "#fff" : "#333", transition: "all 0.2s" }} title="2D View">2D</button>
                    <button onClick={() => setViewMode("3d")} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #666", background: viewMode === "3d" ? "#333" : "#fff", cursor: "pointer", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", color: viewMode === "3d" ? "#fff" : "#333", transition: "all 0.2s" }} title="3D View">3D</button>
                </div>

                <div ref={canvasContainerRef} className="canvas-container" style={{ flex: 1, position: "relative", margin: "0 20px" }}>
                    {/* Snap indicator */}
                    {snapPreview?.snappedPosition && (
                        <div style={{
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
                            zIndex: 1000,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                        }}>
                            Let go off the model now
                        </div>
                    )}
                    
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
                            handleDoubleClick={handleDoubleClick}
                            handleRotateChange={handleRotateChange}
                            getResolvedPosition={getResolvedPosition}
                            rotationTargetId={rotationTargetId}
                            showDimensions={showDimensions && !isExporting}
                            draggingChairId={draggingChairId}
                            dragPosition={dragPosition}
                            zoom={zoom}
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
                            zoom={zoom}
                        />
                    )}

                    {showActionPanel && selectedChair && viewMode === "2d" && (
                        <ModuleActionModal
                            selectedChair={selectedChair}
                            onClose={() => { setShowActionPanel(false); setSelectedChairId(null); }}
                            onRotate={() => { handleRotateRequest(); }}
                            onDuplicate={() => { handleAddChair(selectedChair.sofa); setShowActionPanel(false); setSelectedChairId(null); }}
                            onDelete={() => { handleRemoveChair(selectedChair.id); setShowActionPanel(false); setSelectedChairId(null); }}
                            onAddModules={() => { setShowActionPanel(false); setSelectedChairId(null); setExpandedPanel("addModule"); }}
                            onChangeMaterialModule={() => { setMaterialTargetMode("single"); setMaterialTargetChairId(selectedChair.id); setShowActionPanel(false); setSelectedChairId(null); setExpandedPanel("materials"); }}
                            onChangeMaterialComposition={() => { setMaterialTargetMode("all"); setMaterialTargetChairId(null); setShowActionPanel(false); setSelectedChairId(null); setExpandedPanel("materials"); }}
                        />
                    )}
                </div>

                <div style={{ width: "320px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}>
                        <button onClick={() => togglePanel("addModule")} style={{ width: "100%", padding: "16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#333" }}>
                            <span>ADD MODULE</span>
                            <span style={{ fontSize: "18px" }}>{expandedPanel === "addModule" ? "−" : "+"}</span>
                        </button>
                        {expandedPanel === "addModule" && (
                            <div data-module-menu style={{ padding: "0 16px 16px 16px", maxHeight: "300px", overflowY: "auto" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {availableModules.map((module) => (
                                        <button key={module.id} onClick={() => { handleAddChair(module); setExpandedPanel(null); }} style={{ padding: "10px 16px", borderRadius: "6px", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: "13px", textAlign: "left", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "#f5f5f5"; e.target.style.borderColor = "#1b1b1b"; }} onMouseLeave={(e) => { e.target.style.background = "#fff"; e.target.style.borderColor = "#e0e0e0"; }}>
                                            <div style={{ fontWeight: "500" }}>{module.name}</div>
                                            <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{module.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}>
                        <button onClick={() => togglePanel("materials")} style={{ width: "100%", padding: "16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#333" }}>
                            <span>MATERIALS</span>
                            <span style={{ fontSize: "18px" }}>{expandedPanel === "materials" ? "−" : "+"}</span>
                        </button>
                        {expandedPanel === "materials" && (
                            <div style={{ padding: "0 16px 16px 16px", maxHeight: "500px", overflowY: "auto" }}>
                                {colorSelectors.map((selector) => (
                                    <Palette key={selector.label} label={selector.label} options={selector.options} selectedOptionId={selector.selectedOptionId} onSelect={selector.onSelect} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}>
                        <button onClick={() => togglePanel("composition")} style={{ width: "100%", padding: "16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#333" }}>
                            <span>COMPOSITION LIST</span>
                            <span style={{ fontSize: "18px" }}>{expandedPanel === "composition" ? "−" : "+"}</span>
                        </button>
                        {expandedPanel === "composition" && (
                            <div style={{ padding: "0 16px 16px 16px", maxHeight: "300px", overflowY: "auto" }}>
                                {chairs.map((chair) => (
                                    <div key={chair.id} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #e0e0e0", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <div>
                                            <div style={{ fontSize: "13px", fontWeight: "500" }}>{chair.sofa.name}</div>
                                            <div style={{ fontSize: "11px", color: "#666" }}>{chair.sofa.description}</div>
                                        </div>
                                        <button onClick={() => handleRemoveChair(chair.id)} style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #c00", background: "#fff", color: "#c00", cursor: "pointer", fontSize: "12px" }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ddd", background: "#fff" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#999" }}>spagnol</span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ZoomControls zoom={zoom} setZoom={setZoom} />
                        <button onClick={() => setShowDimensions(!showDimensions)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", background: showDimensions ? "#333" : "#fff", color: showDimensions ? "#fff" : "#000", cursor: "pointer", fontSize: "11px", transition: "all 0.2s" }} title="Dimensions">📐</button>
                        <PDFExport canvasRef={canvasContainerRef} modules={chairs} selectedFabric={selectedChairTexture} setIsExporting={setIsExporting} getResolvedPosition={getResolvedPosition} />
                        <ExportImage canvasRef={canvasContainerRef} />
                        <Export3D modules={chairs} />
                    </div>
                </div>
                <button style={{ padding: "12px 32px", borderRadius: "4px", border: "none", background: "#1a1a1a", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em" }}>REQUEST INFO</button>
            </div>
        </div>
    );
}
