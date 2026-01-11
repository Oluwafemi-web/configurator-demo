import { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector3, Plane } from "three";

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
    const dragOffsetRef = useRef(new Vector3());
    const raycasterRef = useRef(new Raycaster());
    const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0)); // XZ plane at y=0
    const { camera, gl } = useThree();

    // Sync position when prop changes or when switching modes
    useEffect(() => {
        if (groupRef.current && !isDragging) {
            groupRef.current.position.set(position[0], position[1], position[2]);
        }
    }, [position, isDragging, viewMode]);

    const handlePointerMove = useCallback((event) => {
        if (!isDragging || viewMode !== "2d" || disabled || !groupRef.current) return;

        const pointer = gl.domElement.getBoundingClientRect();
        const mouse = new Vector3();
        mouse.x = ((event.clientX - pointer.left) / pointer.width) * 2 - 1;
        mouse.y = -((event.clientY - pointer.top) / pointer.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouse, camera);
        const intersectPoint = new Vector3();
        raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint);

        if (intersectPoint) {
            const newPos = intersectPoint.clone().add(dragOffsetRef.current);
            newPos.y = 0; // Always lock Y to 0
            groupRef.current.position.copy(newPos);

            if (onDrag) {
                onDrag({
                    x: newPos.x,
                    y: 0,
                    z: newPos.z,
                });
            }
        }
    }, [isDragging, viewMode, disabled, camera, gl, onDrag]);

    const handlePointerUp = useCallback((event) => {
        if (!isDragging) return;
        event?.stopPropagation();
        setIsDragging(false);
        
        if (onDragEnd && groupRef.current) {
            onDragEnd({
                x: groupRef.current.position.x,
                y: groupRef.current.position.y,
                z: groupRef.current.position.z,
            });
        }
    }, [isDragging, onDragEnd]);

    const handlePointerDown = (event) => {
        if (disabled || viewMode !== "2d") return;
        event.stopPropagation();
        
        setIsDragging(true);
        
        // Calculate the offset between the mouse position and the object position
        const pointer = gl.domElement.getBoundingClientRect();
        const mouse = new Vector3();
        mouse.x = ((event.clientX - pointer.left) / pointer.width) * 2 - 1;
        mouse.y = -((event.clientY - pointer.top) / pointer.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouse, camera);
        const intersectPoint = new Vector3();
        raycasterRef.current.ray.intersectPlane(planeRef.current, intersectPoint);

        if (intersectPoint && groupRef.current) {
            const currentPos = new Vector3().copy(groupRef.current.position);
            dragOffsetRef.current.subVectors(currentPos, intersectPoint);
        }

        if (onDragStart) {
            onDragStart({
                x: groupRef.current.position.x,
                y: groupRef.current.position.y,
                z: groupRef.current.position.z,
            });
        }
    };

    // Global mouse move and up handlers for dragging
    useEffect(() => {
        if (isDragging && viewMode === "2d") {
            window.addEventListener("mousemove", handlePointerMove);
            window.addEventListener("mouseup", handlePointerUp);
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
            
            return () => {
                window.removeEventListener("mousemove", handlePointerMove);
                window.removeEventListener("mouseup", handlePointerUp);
                window.removeEventListener("pointermove", handlePointerMove);
                window.removeEventListener("pointerup", handlePointerUp);
            };
        }
    }, [isDragging, viewMode, handlePointerMove, handlePointerUp]);

    const handleClick = (event) => {
        if (disabled || isDragging) return;
        event.stopPropagation();
        if (onSelect) {
            onSelect(event);
        }
    };

    // In 2D mode, use custom drag implementation with raycasting
    if (viewMode === "2d") {
        return (
            <group
                ref={groupRef}
                position={position}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                {children}
            </group>
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
