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
