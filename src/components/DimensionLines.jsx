import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { getModuleDimensions } from "../utils/configurator/moduleDimensions";
import { calculateCompositionDimensions, calculateTotalDimensions } from "../utils/configurator/calculateDimensions";

import { rotate } from "three/tsl";

/**
 * DimensionLines Component
 * Renders dimension lines and labels around the furniture composition
 * Shows width, depth, and height measurements in cm and inches using actual module dimensions
 * Different styling for 2D (minimal, clean) vs 3D (detailed with ticks)
 */
export default function DimensionLines({ chairs, getResolvedPosition, viewMode = "3d", visible = true }) {
    // Calculate bounding box and dimensions for separate groups
    const dimensions = useMemo(() => {
        return calculateCompositionDimensions(chairs, getResolvedPosition);
    }, [chairs, getResolvedPosition]);

    // Calculate total bounding box for the entire composition
    const totalDimensions = useMemo(() => {
        return calculateTotalDimensions(chairs, getResolvedPosition);
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

    if (!dimensions || dimensions.length === 0 || !visible) return null;

    const renderDimensionGroup = (dim, isTotal = false) => {
        const { id, bbox, width, depth, height } = dim;
        // Total dimensions get a larger offset to wrap around individual ones
        const baseOffset = isTotal ? 0.8 : 0.3;

        // Render 2D style dimensions (minimal, clean)
        if (viewMode === "2d") {
            const offset = baseOffset;

            return (
                <group key={id}>
                    {/* Width dimension (X-axis) - bottom/front */}
                    <group>
                        {/* Connecting lines from model corners to dimension line */}
                        <Line
                            points={[
                                [bbox.min.x, 0.001, bbox.max.z],
                                [bbox.min.x, 0.001, bbox.max.z + offset],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={1}
                        />
                        <Line
                            points={[
                                [bbox.max.x, 0.001, bbox.max.z],
                                [bbox.max.x, 0.001, bbox.max.z + offset],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={1}
                        />
                        {/* Main horizontal dimension line */}
                        <Line
                            points={[
                                [bbox.min.x, 0.001, bbox.max.z + offset],
                                [bbox.max.x, 0.001, bbox.max.z + offset],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={isTotal ? 2 : 1.5}
                        />
                        {/* Dimension text label */}
                        <Html
                            position={[(bbox.min.x + bbox.max.x) / 2, 0.001, bbox.max.z + offset + 0.15]}
                            center
                            occlude={false}
                            style={{
                                color: isTotal ? "#333" : "#666",
                                fontSize: isTotal ? "11px" : "10px",
                                fontFamily: "Arial, sans-serif",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                pointerEvents: "none",
                                fontWeight: isTotal ? "bold" : "400",
                                background: "rgba(238, 238, 238, 0.9)",
                                padding: "2px 6px",
                                borderRadius: "2px",
                            }}
                        >
                            {formatDimension(width)}
                        </Html>
                    </group>

                    {/* Depth dimension (Z-axis) - only show for individual groups or if total depth is significantly different */}
                    {/* Usually total depth is just max depth, so maybe redundant for total, but let's keep consistent */}
                    <group>
                        {/* Connecting lines from model corners to dimension line */}
                        <Line
                            points={[
                                [bbox.min.x, 0.001, bbox.min.z],
                                [bbox.min.x - offset, 0.001, bbox.min.z],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={1}
                        />
                        <Line
                            points={[
                                [bbox.min.x, 0.001, bbox.max.z],
                                [bbox.min.x - offset, 0.001, bbox.max.z],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={1}
                        />
                        {/* Main vertical dimension line */}
                        <Line
                            points={[
                                [bbox.min.x - offset, 0.001, bbox.min.z],
                                [bbox.min.x - offset, 0.001, bbox.max.z],
                            ]}
                            color={isTotal ? "#666666" : "#999999"}
                            lineWidth={isTotal ? 2 : 1.5}
                        />
                        {/* Dimension text label */}
                        <Html
                            position={[bbox.min.x - offset - 0.15, 0.001, (bbox.min.z + bbox.max.z) / 2]}
                            center
                            occlude={false}
                            style={{
                                color: isTotal ? "#333" : "#666",
                                fontSize: isTotal ? "11px" : "10px",
                                fontFamily: "Arial, sans-serif",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                pointerEvents: "none",
                                fontWeight: isTotal ? "bold" : "400",
                                background: "rgba(238, 238, 238, 0.9)",
                                padding: "2px 6px",
                                borderRadius: "2px",
                                marginLeft: "-50px",
                                transform: "rotate(90deg)",
                            }}
                        >
                            {formatDimension(depth)}
                        </Html>
                    </group>
                </group>
            );
        }

        // Render 3D style dimensions (detailed with ticks)
        const offset = baseOffset;

        return (
            <group key={id}>
                {/* Width dimension (X-axis) - bottom horizontal */}
                <group>
                    {/* Main dimension line */}
                    <Line
                        points={[
                            [bbox.min.x, bbox.min.y - offset, bbox.max.z + offset],
                            [bbox.max.x, bbox.min.y - offset, bbox.max.z + offset],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={isTotal ? 1.5 : 1}
                    />
                    {/* End ticks */}
                    <Line
                        points={[
                            [bbox.min.x, bbox.min.y - offset - 0.1, bbox.max.z + offset],
                            [bbox.min.x, bbox.min.y - offset + 0.1, bbox.max.z + offset],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={1}
                    />
                    <Line
                        points={[
                            [bbox.max.x, bbox.min.y - offset - 0.1, bbox.max.z + offset],
                            [bbox.max.x, bbox.min.y - offset + 0.1, bbox.max.z + offset],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={1}
                    />
                    {/* Label */}
                    <Html
                        position={[(bbox.min.x + bbox.max.x) / 2, bbox.min.y - offset, bbox.max.z + offset]}
                        center
                        transform
                        occlude={false}
                        style={{
                            color: isTotal ? "#666" : "#999",
                            fontSize: "8px",
                            fontFamily: "Arial, sans-serif",
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            pointerEvents: "none",
                            fontWeight: isTotal ? "bold" : "normal",
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
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={isTotal ? 1.5 : 1}
                    />
                    {/* End ticks */}
                    <Line
                        points={[
                            [bbox.min.x - offset - 0.1, bbox.min.y, bbox.min.z],
                            [bbox.min.x - offset + 0.1, bbox.min.y, bbox.min.z],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={1}
                    />
                    <Line
                        points={[
                            [bbox.min.x - offset - 0.1, bbox.min.y, bbox.max.z],
                            [bbox.min.x - offset + 0.1, bbox.min.y, bbox.max.z],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
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
                            color: isTotal ? "#666" : "#999",
                            fontSize: "8px",
                            fontFamily: "Arial, sans-serif",
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            pointerEvents: "none",
                            fontWeight: isTotal ? "bold" : "normal",
                            marginTop: "5px",
                            marginLeft: "5px",
                        }}
                    >
                        {formatDimension(depth)}
                    </Html>
                </group>

                {/* Height dimension (Y-axis) - right vertical */}
                {/* Only show height for individual items or if total height differs? */}
                {/* Usually furniture on same floor has same max height, so total height might just be same as individuals. */}
                {/* Let's show it for consistency if it's the total block. */}
                <group>
                    {/* Main dimension line */}
                    <Line
                        points={[
                            [bbox.max.x + offset, bbox.min.y, bbox.max.z],
                            [bbox.max.x + offset, bbox.max.y, bbox.max.z],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={isTotal ? 1.5 : 1}
                    />
                    {/* End ticks */}
                    <Line
                        points={[
                            [bbox.max.x + offset - 0.1, bbox.min.y, bbox.max.z],
                            [bbox.max.x + offset + 0.1, bbox.min.y, bbox.max.z],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={1}
                    />
                    <Line
                        points={[
                            [bbox.max.x + offset - 0.1, bbox.max.y, bbox.max.z],
                            [bbox.max.x + offset + 0.1, bbox.max.y, bbox.max.z],
                        ]}
                        color={isTotal ? "#666666" : "#999999"}
                        lineWidth={1}
                    />
                    {/* Label */}
                    <Html
                        position={[bbox.max.x + offset, (bbox.min.y + bbox.max.y) / 2, bbox.max.z]}
                        center
                        transform
                        occlude={false}
                        style={{
                            color: isTotal ? "#666" : "#999",
                            fontSize: "8px",
                            fontFamily: "Arial, sans-serif",
                            whiteSpace: "nowrap",
                            userSelect: "none",
                            pointerEvents: "none",
                            transform: "rotate(90deg)",
                            marginRight: "-20px",
                            fontWeight: isTotal ? "bold" : "normal",
                        }}
                    >
                        {formatDimension(height)}
                    </Html>
                </group>
            </group>
        );
    };

    return (
        <group>
            {/* Render individual group dimensions */}
            {dimensions.map((dim) => renderDimensionGroup(dim, false))}

            {/* Render total dimensions if there are multiple groups */}
            {dimensions.length > 1 && totalDimensions && renderDimensionGroup(totalDimensions, true)}
        </group>
    );
}
