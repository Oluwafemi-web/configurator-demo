import { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * CameraController component - manages camera controls and view modes
 * @param {string} viewMode - "2D" or "3D"
 * @param {boolean} isDragging - Whether a module is currently being dragged
 */
export default function CameraController({ viewMode = "3D", isDragging = false }) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  useEffect(() => {
    if (viewMode === "2D") {
      // Switch to orthographic top-down view
      camera.position.set(0, 20, 0);
      camera.lookAt(0, 0, 0);
      
      if (controlsRef.current) {
        controlsRef.current.enableRotate = false;
        controlsRef.current.update();
      }
    } else {
      // Switch to 3D perspective view
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);
      
      if (controlsRef.current) {
        controlsRef.current.enableRotate = true;
        controlsRef.current.update();
      }
    }
  }, [viewMode, camera]);

  // Disable controls when dragging in 2D mode
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2 - 0.1} // Prevent camera from going below floor
      target={[0, 0, 0]}
    />
  );
}
