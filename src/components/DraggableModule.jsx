import { useRef, useState } from "react";
import { DragControls } from "@react-three/drei";

export default function DraggableModule({
    children,
    position,
    onDragStart,
    onDrag,
    onDragEnd,
    onSelect,
    disabled = false,
    viewMode = "2d", // Add viewMode prop to determine rendering strategy
}) {
    const groupRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = () => {
        if (disabled) return;
        setIsDragging(true);
        if (onDragStart) {
            onDragStart({
                x: groupRef.current.position.x,
                y: groupRef.current.position.y,
                z: groupRef.current.position.z,
            });
        }
    };

    const handleDrag = (localMatrix, deltaLocalMatrix, worldMatrix, deltaWorldMatrix) => {
        if (disabled) return;

        // Get the current position from the group
        const pos = groupRef.current.position;

        // Lock Y position to 0 (only allow XZ movement)
        groupRef.current.position.set(pos.x, 0, pos.z);

        if (onDrag) {
            onDrag({
                x: pos.x,
                y: 0,
                z: pos.z,
            });
        }
    };

    const handleDragEnd = () => {
        if (disabled) return;
        setIsDragging(false);
        if (onDragEnd) {
            onDragEnd({
                x: groupRef.current.position.x,
                y: groupRef.current.position.y,
                z: groupRef.current.position.z,
            });
        }
    };

    const handleClick = (event) => {
        if (disabled || isDragging) return;
        event.stopPropagation();
        if (onSelect) {
            onSelect(event);
        }
    };

    // In 2D mode, always use DragControls (just enable/disable it)
    // In 3D mode, don't use DragControls at all
    if (viewMode === "2d") {
        return (
            <>
                <DragControls
                    enabled={!disabled}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                >
                    <group
                        ref={groupRef}
                        position={position}
                        onClick={handleClick}
                    >
                        {children}
                    </group>
                </DragControls>
            </>
        );
    }

    // 3D mode: no drag controls
    return (
        <group
            ref={groupRef}
            position={position}
            onClick={handleClick}
        >
            {children}
        </group>
    );
}
