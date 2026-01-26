import React from "react";

export default function SnapPoint({ position }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#90EE90" />
        </mesh>
    );
}
