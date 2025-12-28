import { useRef, useState, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * SofaModule - Renders an individual sofa module with drag, snap, and texture support
 * @param {Object} module - Module data (id, modelPath, position, rotation)
 * @param {Array} allModules - All modules in the scene for snap detection
 * @param {string} fabricTexture - Path to fabric texture
 * @param {boolean} isSelected - Whether this module is currently selected
 * @param {Function} onClick - Callback when module is clicked
 * @param {Function} onDragEnd - Callback when drag ends with new position
 * @param {Function} onDragMove - Callback during drag with current position
 */
export default function SofaModule({
  module,
  allModules = [],
  fabricTexture = null,
  isSelected = false,
  viewMode = "3D",
  onClick = () => {},
  onDragEnd = () => {},
  onDragMove = () => {},
  onDragStart = () => {},
  onDragStop = () => {},
}) {
  const meshRef = useRef();
  const { scene } = useGLTF(module.modelPath);
  const texture = fabricTexture ? useTexture(fabricTexture) : null;
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [boundingBox, setBoundingBox] = useState(null);
  const { camera, gl } = useThree();

  // Increased snap distance to allow snapping when dragging from the far corners
  const SNAP_DISTANCE = 1.2; // Distance threshold for snapping (in units)

  // Calculate bounding box when model loads
  useEffect(() => {
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      setBoundingBox(box);
    }
  }, []);

  // Apply fabric texture to all meshes in the model
  useEffect(() => {
    if (texture && meshRef.current) {
      // Set texture encoding/finetuning if needed
      texture.flipY = false; // GLTF models usually expect flipY=false
      texture.colorSpace = THREE.SRGBColorSpace; // Modern three.js color management

      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone material to avoid affecting other instances
          // We only need to clone once really, but doing it here ensures isolation
          const material = child.material.clone();
          material.map = texture;
          material.needsUpdate = true;
          child.material = material;
        }
      });
    }
  }, [texture]);

  // Enable shadows for all meshes
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // CRITICAL: Enable pointer events on meshes so they can receive clicks/drags
          child.userData.pointerEvents = true;
        }
      });
    }
  }, []);

  // Connector visualizer (upped to true for debugging as requested)
  const showConnectors = false; // Set to true to debug connector positions

  /**
   * Calculate world position and normal of a connector
   */
  const getConnectorWorldInfo = (modulePos, moduleRot, connector) => {
    const cos = Math.cos(moduleRot);
    const sin = Math.sin(moduleRot);
    
    // Rotate connector offset
    const rx = connector.x * cos - connector.z * sin;
    const rz = connector.x * sin + connector.z * cos;
    
    // Calculate normal (normalized vector from center)
    // Assuming connector.x/z relative to center defines the normal direction
    const len = Math.sqrt(connector.x * connector.x + connector.z * connector.z);
    const nx = (connector.x / len) * cos - (connector.z / len) * sin;
    const nz = (connector.x / len) * sin + (connector.z / len) * cos;

    return { 
      pos: { x: modulePos[0] + rx, z: modulePos[2] + rz },
      normal: { x: nx, z: nz }
    };
  };

  /**
   * Find the nearest snap point considering connectors
   * Returns the new position for the module center
   */
  const findSnapPoint = (currentPos) => {
    if (!module.connectors || module.connectors.length === 0) return null;

    let nearestSnap = null;
    let minDistance = SNAP_DISTANCE;

    allModules.forEach((otherModule) => {
      if (otherModule.id === module.id) return;
      if (!otherModule.connectors || otherModule.connectors.length === 0) return;

      otherModule.connectors.forEach((otherConn) => {
        // Info of the connector on the OTHER module in world space
        const target = getConnectorWorldInfo(
          otherModule.position,
          otherModule.rotation,
          otherConn
        );

        // Check against ALL connectors of the CURRENT dragging module
        module.connectors.forEach((myConn) => {
          // Calculate my connector's info if we were at the current drag position
          // Note: Rotation is constant during drag for now
          // We need "my" normal in world space
          
          const myRot = module.rotation || 0;
          const myCos = Math.cos(myRot);
          const mySin = Math.sin(myRot);
          
          // My Normal
          const len = Math.sqrt(myConn.x * myConn.x + myConn.z * myConn.z);
          const myNx = (myConn.x / len) * myCos - (myConn.z / len) * mySin;
          const myNz = (myConn.x / len) * mySin + (myConn.z / len) * myCos;

          // Check alignment: Normals should be opposite (dot product approx -1)
          const dot = target.normal.x * myNx + target.normal.z * myNz;
          
          // Allow some tolerance, but roughly opposite
          if (dot > -0.8) return; // Skip if not facing each other

          // Rotated offset for position calculation
          const myRx = myConn.x * myCos - myConn.z * mySin;
          const myRz = myConn.x * mySin + myConn.z * myCos;

          // Proposed center position
          const proposeX = target.pos.x - myRx;
          const proposeZ = target.pos.z - myRz;

          // Check distance between current drag position and this proposed snap position
          const dx = currentPos.x - proposeX;
          const dz = currentPos.z - proposeZ;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < minDistance) {
            minDistance = distance;
            nearestSnap = { x: proposeX, z: proposeZ };
          }
        });
      });
    });

    return nearestSnap;
  };

  const handlePointerDown = (e) => {
    console.log("[SofaModule] PointerDown event fired", { viewMode, moduleId: module.id });
    e.stopPropagation();
    // Only allow dragging in 2D view
    if (viewMode === "2D") {
      console.log("[SofaModule] Starting drag in 2D mode");
      setIsDragging(true);
      onDragStart();
    }
    onClick();
  };

  const handlePointerUp = (e) => {
    console.log("[SofaModule] PointerUp event fired", { isDragging });
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      setIsSnapping(false);
      onDragStop();

      // Get final position and call onDragEnd
      if (meshRef.current) {
        const pos = meshRef.current.position;
        onDragEnd([pos.x, pos.y, pos.z]);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    console.log("[SofaModule] PointerMove during drag");
    e.stopPropagation();

    // Calculate new position based on mouse movement
    // Project mouse position onto the floor plane (y=0)
    const rect = gl.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouse = new THREE.Vector2(
      (x / rect.width) * 2 - 1,
      -(y / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Create a plane at y=0 (floor level)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection && meshRef.current) {
      // Check for snap points
      const snapPoint = findSnapPoint(intersection);

      if (snapPoint) {
        // Snap to the nearest module
        meshRef.current.position.set(snapPoint.x, 0, snapPoint.z);
        setIsSnapping(true);
      } else {
        // Free movement
        meshRef.current.position.set(intersection.x, 0, intersection.z);
        setIsSnapping(false);
      }

      // Notify parent of drag movement
      onDragMove([
        meshRef.current.position.x,
        0,
        meshRef.current.position.z,
      ]);
    }
  };

  // Attach global pointer move and up handlers when dragging
  useEffect(() => {
    if (isDragging) {
      console.log("[SofaModule] Attaching global pointer handlers");
      const handleGlobalMove = (e) => handlePointerMove(e);
      const handleGlobalUp = (e) => handlePointerUp(e);

      window.addEventListener("pointermove", handleGlobalMove);
      window.addEventListener("pointerup", handleGlobalUp);

      return () => {
        console.log("[SofaModule] Removing global pointer handlers");
        window.removeEventListener("pointermove", handleGlobalMove);
        window.removeEventListener("pointerup", handleGlobalUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <group
      ref={meshRef}
      position={module.position || [0, 0, 0]}
      rotation={[0, module.rotation || 0, 0]}
      scale={isSelected ? 1.05 : 1}
    >
      {/* Actual 3D model */}
      <primitive object={scene.clone()} />
      
      {/* Invisible interaction mesh for pointer events */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        visible={false}
      >
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Visual snap indicator - green outline when snapping */}
      {isSnapping && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.2, 0.1, 1.2]} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}

      {/* Debug visualization for connectors */}
      {showConnectors && module.connectors && module.connectors.map((conn, i) => (
        <mesh key={i} position={[conn.x, 0.5, conn.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}

// Preload common models
const modelPaths = [
  "/models/JUMP_SOFA/3D_MODELS/Jump_Center.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_Left.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_Right.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_BigSeat.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_Angle.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_BigAngle.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_Pouf.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_SeatPouf.gltf",
  "/models/JUMP_SOFA/3D_MODELS/Jump_ChaisePouf.gltf",
];

modelPaths.forEach((path) => useGLTF.preload(path));
