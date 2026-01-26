import React from "react";
import SnapPoint from "./SnapPoint";
import { getModuleDimensions } from "../../utils/configurator/moduleDimensions";

export default function ModuleSnapPoints({ chair }) {
    const dims = getModuleDimensions(chair.sofa.id);
    const w = dims.width / 100;
    const d = dims.depth / 100;

    // We want points slightly outside the mesh
    // Since we are inside the rotated group of the chair, we use the raw width/depth
    // No need to swap depending on rotation here.

    return (
        <group>
            {/* Right */}
            <SnapPoint position={[w / 2, 0, 0]} />
            {/* Left */}
            <SnapPoint position={[-w / 2, 0, 0]} />
            {/* Back - Only show if no backrest */}
            {!chair.sofa.hasBackrest && (
                <SnapPoint position={[0, 0, -d / 2]} />
            )}
            {/* Front */}
            <SnapPoint position={[0, 0, d / 2]} />
        </group>
    );
}
