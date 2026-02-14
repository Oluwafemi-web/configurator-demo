import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, ContactShadows, Line } from "@react-three/drei";
import Model from "../../Model";
import DraggableModule from "../DraggableModule";
import RotationRing from "../RotationRing";
import DimensionLines from "../DimensionLines";
import { MODULE_DIMENSIONS } from "../../utils/configurator/moduleDimensions";

const SNAP_DISTANCE = 2.5;

/**
 * Canvas2DView Component
 * Dedicated canvas for 2D top-down orthographic view with drag-and-drop functionality
 */
export default function Canvas2DView({
    chairs,
    selectedChairTexture,
    selectedPillowTexture,
    selectedFeetTexture,
    snapPreview,
    rotationTarget,
    isDragging2D,
    canvasContainerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleSelectChair,
    handleDoubleClick,
    handleRotateChange,
    getResolvedPosition,
    rotationTargetId,
    showDimensions,
    draggingChairId,
    dragPosition,
    selectedChairId,
    zoom = 100,
    focusedChairId,
}) {
    return (
        <Canvas
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                position: [0, 1.5, 5],
                zoom: zoom,
            }}
        >
            {/* Orthographic Camera - Top-down view */}
            <OrthographicCamera
                makeDefault
                position={[1, 1, 1]}
                zoom={zoom}
                rotation={[-Math.PI / 2, 0, 0]}
                near={0}
            />

            {/* Lighting */}
            <ambientLight intensity={2} />
            <directionalLight position={[3, 3, 3]} intensity={1} />

            {/* Render all chair modules */}
            {chairs.length > 0 ? (
                chairs.map((chair) => {
                    const isDraggingThis = draggingChairId === chair.id;
                    const position = isDraggingThis && snapPreview
                        ? snapPreview.snappedPosition
                        : getResolvedPosition(chair);
                    
                    const moduleId = chair.sofa.id;
                    const dims = MODULE_DIMENSIONS[moduleId] || { width: 99, depth: 99, originX: 0, originZ: 0 };
                    const width = dims.width / 100;
                    const depth = dims.depth / 100;
                    const originX = dims.originX || 0;
                    const originZ = dims.originZ || 0;
                    
                    // Check if this is a chaise or seat pouf (not the regular jump-pouf)
                    const moduleIdLower = moduleId?.toLowerCase() || '';
                    const isPouf = moduleIdLower.includes('chaisepouf') || moduleIdLower.includes('seatpouf');

                    return (
                        <DraggableModule
                            key={chair.id}
                            position={position}
                            viewMode="2d"
                            disabled={rotationTargetId === chair.id}
                            selected={chair.id === selectedChairId}
                            moduleWidth={width}
                            moduleDepth={depth}
                            isPouf={isPouf}
                            onDragStart={() => handleDragStart(chair)}
                            onDrag={(pos) => handleDragMove(chair, pos)}
                            onDragEnd={(finalPos) => handleDragEnd(chair, finalPos)}
                            onSelect={(event, isFirstClick) => handleSelectChair(chair, event, isFirstClick)}
                            onDoubleClick={(event) => handleDoubleClick(chair, event)}
                        >
                            <group rotation={[0, chair.rotation || 0, 0]}>
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
                                    width={width}
                                    depth={depth}
                                    originX={originX}
                                    originZ={originZ}
                                    isFocused={chair.id === focusedChairId}
                                    isPouf={isPouf}
                                />
                            </group>
                        </DraggableModule>
                    );
                })
            ) : null}

            {/* Rotation Ring - Shows when rotating a module */}
            {rotationTarget && (
                <RotationRing
                    position={getResolvedPosition(rotationTarget)}
                    angle={((rotationTarget.rotation || 0) * 180) / Math.PI}
                    onRotate={(deg) => handleRotateChange(rotationTarget.id, deg)}
                    onClose={() => handleRotateChange(null)}
                />
            )}

            {/* Contact Shadows for soft, diffused shadows beneath models */}
            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.35}
                scale={15}
                blur={2.5}
                far={4}
                resolution={512}
                color="#1a1a1a"
            />

            {/* Dimension Lines - Shows measurements when enabled */}
            {showDimensions && chairs.length > 0 && (
                <DimensionLines
                    chairs={chairs}
                    getResolvedPosition={getResolvedPosition}
                    viewMode="2d"
                />
            )}
        </Canvas>
    );
}
