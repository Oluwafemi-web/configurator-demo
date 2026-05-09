import { Html } from "@react-three/drei";
import { useState, useRef } from "react";

export default function RotationRing({ position, angle, onRotate, onClose }) {
    const [isDragging, setIsDragging] = useState(false);
    const startAngleRef = useRef(0);
    const currentAngleRef = useRef(angle);
    // FIX: store the container ref so we always measure the ring's own center,
    // not whatever child element happens to be under the pointer.
    const containerRef = useRef(null);

    const getRingCenter = () => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    };

    const handlePointerDown = (e) => {
        e.stopPropagation();
        // Capture the pointer so pointermove fires even if cursor leaves the element
        e.target.setPointerCapture(e.pointerId);
        setIsDragging(true);
        const { x: centerX, y: centerY } = getRingCenter();
        startAngleRef.current =
            Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        currentAngleRef.current = angle;
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const { x: centerX, y: centerY } = getRingCenter();
        const currentMouseAngle =
            Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        let delta = currentMouseAngle - startAngleRef.current;

        // Normalize delta to handle wrapping around 360/0 boundary
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        // Negate delta: clockwise drag = clockwise model rotation
        const newAngle = (currentAngleRef.current - delta + 360) % 360;
        onRotate(newAngle);
    };

    const handlePointerUp = (e) => {
        if (isDragging) {
            e.target.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
    };

    return (
        <Html position={position} center>
            <div
                ref={containerRef}
                style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    pointerEvents: "auto",
                    touchAction: "none",
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

                {/* Angle indicator line */}
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
                        pointerEvents: "none",
                    }}
                />

                {/* Angle value display */}
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
