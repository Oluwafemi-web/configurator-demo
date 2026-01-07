import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export default function DraggableModule({
    children,
    position,
    onDragStart,
    onDrag,
    onDragEnd,
    onSelect,
    disabled = false,
}) {
    const ref = useRef(null);
    const plane = useMemo(
        () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        []
    );
    const offsetRef = useRef(new THREE.Vector3());
    const intersection = useRef(new THREE.Vector3());
    const [isDragging, setIsDragging] = useState(false);
    const [moved, setMoved] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.position.set(position[0], position[1], position[2]);
    }, [position]);

    const handlePointerDown = (event) => {
        if (disabled) return;
        event.stopPropagation();
        setIsDragging(true);
        event.target.setPointerCapture(event.pointerId);
        setMoved(false);
        onDragStart?.({
            x: ref.current.position.x,
            y: ref.current.position.y,
            z: ref.current.position.z,
        });

        if (event.ray.intersectPlane(plane, intersection.current)) {
            offsetRef.current.copy(intersection.current).sub(ref.current.position);
        }
    };

    const handlePointerMove = (event) => {
        if (!isDragging || disabled) return;
        event.stopPropagation();
        if (event.ray.intersectPlane(plane, intersection.current)) {
            const nextPos = intersection.current.sub(offsetRef.current);
            ref.current.position.copy(nextPos);
            setMoved(true);
            onDrag?.({
                x: nextPos.x,
                y: nextPos.y,
                z: nextPos.z,
            });
        }
    };

    const handlePointerUp = (event) => {
        if (!isDragging) return;
        event.stopPropagation();
        setIsDragging(false);
        event.target.releasePointerCapture(event.pointerId);
        onDragEnd?.({
            x: ref.current.position.x,
            y: ref.current.position.y,
            z: ref.current.position.z,
        });
    };

    const handleClick = (event) => {
        if (disabled || moved) return;
        onSelect?.(event);
    };

    return (
        <group
            ref={ref}
            position={position}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            onClick={handleClick}
        >
            {children}
        </group>
    );
}
