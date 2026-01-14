import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { getModuleDimensions } from "../utils/configurator/moduleDimensions";
import { rotate } from "three/tsl";

/**
 * DimensionLines Component
 * Renders dimension lines and labels around the furniture composition
 * Shows width, depth, and height measurements in cm and inches using actual module dimensions
 * Different styling for 2D (minimal, clean) vs 3D (detailed with ticks)
 */
export default function DimensionLines({ chairs, getResolvedPosition, viewMode = "3d" }) {
    // Calculate bounding box and dimensions using actual module sizes
    const dimensions = useMemo(() => {
        if (!chairs || chairs.length === 0) return null;

        const bbox = new THREE.Box3();

        // Expand bounding box to include all chairs with their actual dimensions
        chairs.forEach((chair) => {
            const pos = getResolvedPosition(chair);
            const moduleDims = getModuleDimensions(chair.sofa.id);

            // Convert cm to meters for Three.js
            const width = moduleDims.width / 100;
            const depth = moduleDims.depth / 100;
            const height = moduleDims.height / 100;

            // Expand bbox considering rotation
            const rotation = chair.rotation || 0;
            const cos = Math.abs(Math.cos(rotation));
            const sin = Math.abs(Math.sin(rotation));

            // Rotated dimensions
            const rotatedWidth = width * cos + depth * sin;
            const rotatedDepth = width * sin + depth * cos;

            bbox.expandByPoint(new THREE.Vector3(
                pos[0] - rotatedWidth / 2,
                0,
                pos[2] - rotatedDepth / 2
            ));
            bbox.expandByPoint(new THREE.Vector3(
                pos[0] + rotatedWidth / 2,
                height,
                pos[2] + rotatedDepth / 2
            ));
        });

        const width = bbox.max.x - bbox.min.x;
        const depth = bbox.max.z - bbox.min.z;
        const height = bbox.max.y - bbox.min.y;

        return {
            bbox,
            width,
            depth,
            height,
            center: new THREE.Vector3(
                (bbox.min.x + bbox.max.x) / 2,
                (bbox.min.y + bbox.max.y) / 2,
                (bbox.min.z + bbox.max.z) / 2
            ),
        };
    }, [chairs, getResolvedPosition]);

    // Convert cm to inches with fractional display
    const cmToInches = (cm) => {
        const inches = cm / 2.54;
        const whole = Math.floor(inches);
        const fraction = inches - whole;
        const eighths = Math.round(fraction * 8);

        if (eighths === 0) return `${whole}"`;
        if (eighths === 8) return `${whole + 1}"`;
        return `${whole} ${eighths}/8"`;
    };

    // Format dimension label
    const formatDimension = (meters) => {
        const cm = Math.round(meters * 100);
        const inches = cmToInches(cm);
        return `${cm} cm (${inches})`;
    };

    if (!dimensions) return null;

    const { bbox, width, depth, height } = dimensions;

    // Render 2D style dimensions (minimal, clean)
    if (viewMode === "2d") {
        const offset = 0.5; // Larger offset for cleaner look

        return (
            <group>
                {/* Width dimension (X-axis) - bottom */}
                <group>
                    {/* Connecting lines from model to dimension line */}
                    <Line
                        points={[
                            [bbox.min.x, 0, bbox.max.z],
                            [bbox.min.x, 0, bbox.max.z + offset],
                        ]}
                        color="#CCCCCC"
                        lineWidth={0.5}
                    />
                    <Line
                        points={[
                            [bbox.max.x, 0, bbox.max.z],
                            [bbox.max.x, 0, bbox.max.z + offset],
                        ]}
                        color="#CCCCCC"
                        lineWidth={0.5}
                    />
                    {/* Main dimension line */}
                    <Line
                        points={[
                            [bbox.min.x, 0, bbox.max.z + offset],
                            [bbox.max.x, 0, bbox.max.z + offset],
                        ]}
                        color="#AAAAAA"
                        lineWidth={1}
                    />
                    {/* Label */}
                    <Html
                        position={[(bbox.min.x + bbox.max.x) / 2, 0, bbox.max.z + offset + 0.1]}
                        center
                        transform
                        occlude={false}
                        style={{
                            color: "#999",
                            fontSize: "7px",
                            fontFamily: "Arial, sans-serif",
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            pointerEvents: "none",
                            fontWeight: "300",
                        }}
                    >
                        {formatDimension(width)}
                    </Html>
                </group>

                {/* Depth dimension (Z-axis) - left */}
                <group>
                    {/* Connecting lines from model to dimension line */}
                    <Line
                        points={[
                            [bbox.min.x, 0, bbox.min.z],
                            [bbox.min.x - offset, 0, bbox.min.z],
                        ]}
                        color="#CCCCCC"
                        lineWidth={0.5}
                    />
                    <Line
                        points={[
                            [bbox.min.x, 0, bbox.max.z],
                            [bbox.min.x - offset, 0, bbox.max.z],
                        ]}
                        color="#CCCCCC"
                        lineWidth={0.5}
                    />
                    {/* Main dimension line */}
                    <Line
                        points={[
                            [bbox.min.x - offset, 0, bbox.min.z],
                            [bbox.min.x - offset, 0, bbox.max.z],
                        ]}
                        color="#AAAAAA"
                        lineWidth={1}
                    />
                    {/* Label */}
                    <Html
                        position={[bbox.min.x - offset - 0.1, 0, (bbox.min.z + bbox.max.z) / 2]}
                        center
                        transform
                        occlude={false}
                        rotation={[0, 0, Math.PI / 2]}
                        style={{
                            color: "#999",
                            fontSize: "7px",
                            fontFamily: "Arial, sans-serif",
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            pointerEvents: "none",
                            fontWeight: "300",
                        }}
                    >
                        {formatDimension(depth)}
                    </Html>
                </group>
            </group>
        );
    }

    // Render 3D style dimensions (detailed with ticks)
    const offset = 0.3;

    return (
        <group>
            {/* Width dimension (X-axis) - bottom horizontal */}
            <group>
                {/* Main dimension line */}
                <Line
                    points={[
                        [bbox.min.x, bbox.min.y - offset, bbox.max.z + offset],
                        [bbox.max.x, bbox.min.y - offset, bbox.max.z + offset],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* End ticks */}
                <Line
                    points={[
                        [bbox.min.x, bbox.min.y - offset - 0.1, bbox.max.z + offset],
                        [bbox.min.x, bbox.min.y - offset + 0.1, bbox.max.z + offset],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                <Line
                    points={[
                        [bbox.max.x, bbox.min.y - offset - 0.1, bbox.max.z + offset],
                        [bbox.max.x, bbox.min.y - offset + 0.1, bbox.max.z + offset],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* Label */}
                <Html
                    position={[(bbox.min.x + bbox.max.x) / 2, bbox.min.y - offset, bbox.max.z + offset]}
                    center
                    transform
                    occlude={false}
                    style={{
                        color: "#999",
                        fontSize: "8px",
                        fontFamily: "Arial, sans-serif",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        pointerEvents: "none",
                        marginTop: '10px'
                    }}
                >
                    {formatDimension(width)}
                </Html>
            </group>

            {/* Depth dimension (Z-axis) - left horizontal */}
            <group>
                {/* Main dimension line */}
                <Line
                    points={[
                        [bbox.min.x - offset, bbox.min.y, bbox.min.z],
                        [bbox.min.x - offset, bbox.min.y, bbox.max.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* End ticks */}
                <Line
                    points={[
                        [bbox.min.x - offset - 0.1, bbox.min.y, bbox.min.z],
                        [bbox.min.x - offset + 0.1, bbox.min.y, bbox.min.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                <Line
                    points={[
                        [bbox.min.x - offset - 0.1, bbox.min.y, bbox.max.z],
                        [bbox.min.x - offset + 0.1, bbox.min.y, bbox.max.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* Label */}
                <Html
                    position={[
                        bbox.min.x - offset - 0.2,
                        bbox.min.y + 0.001, // tiny lift to avoid z-fighting
                        (bbox.min.z + bbox.max.z) / 2,
                    ]}
                    rotation={[Math.PI / 2, Math.PI / 1, 1.5]}
                    center
                    transform
                    occlude={false}
                    style={{
                        color: "#999",
                        fontSize: "8px",
                        fontFamily: "Arial, sans-serif",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        pointerEvents: "none",
                        marginTop: "5px",
                        marginLeft: "5px",
                    }}
                >
                    {formatDimension(depth)}
                </Html>
            </group>

            {/* Height dimension (Y-axis) - right vertical */}
            <group>
                {/* Main dimension line */}
                <Line
                    points={[
                        [bbox.max.x + offset, bbox.min.y, bbox.max.z],
                        [bbox.max.x + offset, bbox.max.y, bbox.max.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* End ticks */}
                <Line
                    points={[
                        [bbox.max.x + offset - 0.1, bbox.min.y, bbox.max.z],
                        [bbox.max.x + offset + 0.1, bbox.min.y, bbox.max.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                <Line
                    points={[
                        [bbox.max.x + offset - 0.1, bbox.max.y, bbox.max.z],
                        [bbox.max.x + offset + 0.1, bbox.max.y, bbox.max.z],
                    ]}
                    color="#999999"
                    lineWidth={1}
                />
                {/* Label */}
                <Html
                    position={[bbox.max.x + offset, (bbox.min.y + bbox.max.y) / 2, bbox.max.z]}
                    center
                    transform
                    occlude={false}
                    style={{
                        color: "#999",
                        fontSize: "8px",
                        fontFamily: "Arial, sans-serif",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                        pointerEvents: "none",
                        transform: "rotate(90deg)",
                        marginRight: "-20px"
                    }}
                >
                    {formatDimension(height)}
                </Html>
            </group>
        </group>
    );
}
