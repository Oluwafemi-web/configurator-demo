import { Html } from "@react-three/drei";
import { useState, useRef } from "react";

export default function RotationRing({ position, angle, onRotate, onClose }) {
    const [isDragging, setIsDragging] = useState(false);
    const startAngleRef = useRef(0);
    const currentAngleRef = useRef(angle);

    const handlePointerDown = (e) => {
        e.stopPropagation();
        setIsDragging(true);
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        currentAngleRef.current = angle;
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        let delta = currentMouseAngle - startAngleRef.current;

        // Normalize delta to handle wrapping around 360/0 boundary
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        // Negate delta to fix rotation direction (clockwise ring = clockwise model)
        const newAngle = (currentAngleRef.current - delta + 360) % 360;
        onRotate(newAngle);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    return (
        <Html position={position} center>
            <div
                style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    pointerEvents: "auto",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Rotation ring */}
                <div
                    style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        border: "3px dashed #1b1b1b",
                        borderRadius: "50%",
                        boxSizing: "border-box",
                    }}
                />

                {/* Angle indicator */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "50%",
                        height: "3px",
                        background: "#1b1b1b",
                        transformOrigin: "left center",
                        transform: `translate(0, -50%) rotate(${angle}deg)`,
                    }}
                />

                {/* Angle Value Display */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        pointerEvents: "none",
                        color: "#1b1b1b",
                        border: "1px solid #ddd",
                    }}
                >
                    {Math.round(angle)}°
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "2px solid #1b1b1b",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ✕
                </button>
            </div>
        </Html>
    );
}
