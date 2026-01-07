import { useRef, useState, useEffect, useMemo, useCallback, useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function SofaModule({
  module,
  allModules = [],
  fabricTexture,
  isSelected = false,
  viewMode = "3D",
  onClick = () => { },
  onDragStart = () => { },
  onDragMove = () => { },
  onDragEnd = () => { },
  onDragStop = () => { },
}) {
  /** ------------------ THREE SETUP ------------------ */
  const { scene } = useGLTF(module.modelPath);
  const model = useMemo(() => scene.clone(true), [scene]);

  const groupRef = useRef(null);
  const { camera, gl } = useThree();

  // Apply Texture and Shadows
  useEffect(() => {
    if (!model) return;


    // Enable shadows for all meshes
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    let isMounted = true;


    // Apply Texture if available
    if (fabricTexture) {
      console.log(fabricTexture)
      new THREE.TextureLoader().load(fabricTexture, (tex) => {
        if (!isMounted) return; // Race condition check

        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;

        model.traverse((child) => {
          console.log(child, tex)
          if (child.isMesh && child.material) {
            // Clone material to ensure unique instance for this module
            if (!child.material.userData.isUnique) {
              child.material = child.material.clone();
              child.material.userData.isUnique = true;
            }
            child.material.map = tex;
            child.material.color.setHex(0xffffff); // Reset color to white to avoid tinting
            child.material.needsUpdate = true;
          }
        });
      });
    }

    return () => {
      isMounted = false;
    };
  }, [model, fabricTexture]);


  useLayoutEffect(() => {
    if (!groupRef.current) return

    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = box.getCenter(new THREE.Vector3())

    // Move model so its center is at world origin
    groupRef.current.position.sub(center)

  }, [])

  /** ------------------ DRAG STATE ------------------ */
  const draggingRef = useRef(false);
  const snappingRef = useRef(false);
  const lastSnapCheck = useRef(0);

  /** ------------------ REUSED THREE OBJECTS ------------------ */
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);

  /** ------------------ CONSTANTS ------------------ */
  const SNAP_DISTANCE = 1.2;
  const SNAP_THROTTLE_MS = 50;

  /** ------------------ SNAP LOGIC ------------------ */
  const getConnectorWorldInfo = useCallback((pos, rot, c) => {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    const rx = c.x * cos - c.z * sin;
    const rz = c.x * sin + c.z * cos;

    const len = Math.hypot(c.x, c.z) || 1;
    const nx = (c.x / len) * cos - (c.z / len) * sin;
    const nz = (c.x / len) * sin + (c.z / len) * cos;

    return {
      pos: { x: pos[0] + rx, z: pos[2] + rz },
      normal: { x: nx, z: nz },
    };
  }, []);

  const findSnapPoint = useCallback(
    (current) => {
      if (!module.connectors?.length) return null;

      let closest = null;
      let min = SNAP_DISTANCE;

      for (const other of allModules) {
        if (other.id === module.id || !other.connectors?.length) continue;

        for (const oc of other.connectors) {
          const target = getConnectorWorldInfo(
            other.position,
            other.rotation || 0,
            oc
          );

          for (const mc of module.connectors) {
            const rot = module.rotation || 0;
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);

            const len = Math.hypot(mc.x, mc.z) || 1;
            const nx = (mc.x / len) * cos - (mc.z / len) * sin;
            const nz = (mc.x / len) * sin + (mc.z / len) * cos;

            if (target.normal.x * nx + target.normal.z * nz > -0.8) continue;

            const rx = mc.x * cos - mc.z * sin;
            const rz = mc.x * sin + mc.z * cos;

            const px = target.pos.x - rx;
            const pz = target.pos.z - rz;

            const d = Math.hypot(current.x - px, current.z - pz);
            if (d < min) {
              min = d;
              closest = { x: px, z: pz };
            }
          }
        }
      }
      return closest;
    },
    [allModules, module, getConnectorWorldInfo]
  );

  /** ------------------ POINTER HANDLERS ------------------ */
  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      onClick();

      if (viewMode === "2D") {
        draggingRef.current = true;
        onDragStart();
      }
    },
    [viewMode, onClick, onDragStart]
  );

  const onGlobalPointerMove = useCallback(
    (e) => {
      if (!draggingRef.current || !groupRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, intersection);

      const now = performance.now();
      let snapped = false;

      if (now - lastSnapCheck.current > SNAP_THROTTLE_MS) {
        const snap = findSnapPoint(intersection);
        lastSnapCheck.current = now;

        if (snap) {
          groupRef.current.position.set(snap.x, 0, snap.z);
          snapped = true;
        }
      }

      if (!snapped) {
        groupRef.current.position.set(intersection.x, 0, intersection.z);
      }

      snappingRef.current = snapped;

      onDragMove([
        groupRef.current.position.x,
        0,
        groupRef.current.position.z,
      ]);
    },
    [camera, gl, raycaster, plane, intersection, mouse, findSnapPoint, onDragMove]
  );

  const onGlobalPointerUp = useCallback(() => {
    if (!draggingRef.current || !groupRef.current) return;

    draggingRef.current = false;
    onDragStop();

    const p = groupRef.current.position;
    onDragEnd([p.x, p.y, p.z]);
  }, [onDragEnd, onDragStop]);

  /** ------------------ GLOBAL LISTENERS ------------------ */
  useEffect(() => {
    window.addEventListener("pointermove", onGlobalPointerMove);
    window.addEventListener("pointerup", onGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", onGlobalPointerMove);
      window.removeEventListener("pointerup", onGlobalPointerUp);
    };
  }, [onGlobalPointerMove, onGlobalPointerUp]);

  /** ------------------ RENDER ------------------ */
  return (
    <group
      ref={groupRef}
      position={module.position || [0, 0, 0]}
      rotation={[0, module.rotation || 0, 0]}
      scale={isSelected ? 2.6 : 2.5}
    >
      <primitive object={model} />

      {/* Interaction proxy */}
      <mesh visible={false} onPointerDown={onPointerDown}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        {/* <meshBasicMaterial transparent opacity={0.3} /> */}
      </mesh>
    </group>
  );
}
