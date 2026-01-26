import { Canvas } from "@react-three/fiber";
import {
    OrthographicCamera,
    ContactShadows,
    Environment,
    Line,
} from "@react-three/drei";
import Model from "../../Model";
import DraggableModule from "../DraggableModule";
import RotationRing from "../RotationRing";
import DimensionLines from "../DimensionLines";
import ModuleSnapPoints from "./ModuleSnapPoints";
import SnapPoint from "./SnapPoint";

const CHAIR_WIDTH = 1.14;

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
    handleRotateChange,
    getResolvedPosition,
    rotationTargetId,
    showDimensions,
}) {
    return (
        <Canvas
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                position: [0, 1.5, 5],
                zoom: 50,
            }}
        >
            {/* Orthographic Camera - Top-down view */}
            <OrthographicCamera
                makeDefault
                position={[1, 1, 1]}
                zoom={100}
                rotation={[-Math.PI / 2, 0, 0]}
                near={0}
            />

            {/* Lighting */}
            <ambientLight intensity={2} />
            <directionalLight position={[3, 3, 3]} intensity={1} />

            {/* Render all chair modules */}
            {chairs.length > 0 ? (
                chairs.map((chair) => {
                    const resolvedPosition = getResolvedPosition(chair);
                    return (
                        <DraggableModule
                            key={chair.id}
                            position={resolvedPosition}
                            viewMode="2d"
                            disabled={rotationTargetId === chair.id}
                            onDragStart={() => handleDragStart(chair)}
                            onDrag={(pos) => handleDragMove(chair, pos)}
                            onDragEnd={(finalPos) => handleDragEnd(chair, finalPos)}
                            onSelect={(event) => handleSelectChair(chair, event)}
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
                                    position={[0, 0, 0]}
                                />
                                {isDragging2D && (
                                    <ModuleSnapPoints chair={chair} />
                                )}
                            </group>
                        </DraggableModule>
                    );
                })
            ) : null}

            {/* Snap Preview - Shows where module will snap */}
            {snapPreview && (
                <group>
                    <Line
                        points={[
                            (() => {
                                const { neighborPosition, neighborDims, side } = snapPreview;
                                const start = [...neighborPosition];
                                // Offset the start point to the far edge of the neighbor
                                // "Full length of neighbor" + "Half length of new module"
                                // Current center-to-center = Half neighbor + Half new
                                // So we need to push the start point back by another Half neighbor
                                if (side === 'right') start[0] -= neighborDims.width / 2;
                                if (side === 'left') start[0] += neighborDims.width / 2;
                                if (side === 'top') start[2] += neighborDims.depth / 2;
                                if (side === 'bottom') start[2] -= neighborDims.depth / 2;

                                return [start[0], 0.05, start[2]];
                            })(),
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
                                (snapPreview.draggedDims?.width ?? CHAIR_WIDTH) * 0.9,
                                0.005,
                                (snapPreview.draggedDims?.depth ?? CHAIR_WIDTH) * 0.9,
                            ]}
                        />
                        <meshStandardMaterial
                            color="#111111"
                            transparent
                            opacity={0.15}
                        />
                    </mesh>

                    {/* The Green Dot on the Neighbor - Highlight the snap point */}
                    {(() => {
                        const { neighborPosition, neighborDims, side } = snapPreview;
                        const dotPos = [...neighborPosition];
                        if (side === 'right') dotPos[0] -= neighborDims.width / 2;
                        if (side === 'left') dotPos[0] += neighborDims.width / 2;
                        if (side === 'top') dotPos[2] += neighborDims.depth / 2;
                        if (side === 'bottom') dotPos[2] -= neighborDims.depth / 2;

                        return <SnapPoint position={[dotPos[0], 0.06, dotPos[2]]} />;
                    })()}
                </group>
            )}

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

            {/* Environment lighting */}
            <Environment preset="night" />
        </Canvas>
    );
}
