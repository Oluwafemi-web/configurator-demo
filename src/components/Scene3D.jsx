import { Canvas } from "@react-three/fiber";
import { useState, useEffect, Suspense, useRef } from "react";
import {

  Environment,
  CameraControls,
  useTexture
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import SofaModule from "./SofaModule";
import { upholsteryCategories } from "../constants";


const TexturePreloader = () => {

  upholsteryCategories.forEach((category) => {
    category.items.forEach((item) => {
      useTexture.preload(item.path);
    });
  });


};

/**
 * CameraManager - Handles camera switching between 2D and 3D modes
 */
function CameraManager({ viewMode, isDragging }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    if (viewMode === "2D") {
      // Lock to perfect top-down orthographic view
      camera.position.set(0, 50, 0);
      camera.rotation.set(-Math.PI / 2, 0, 0); // Point straight down
      camera.lookAt(0, 0, 0);
      camera.zoom = 5;
      camera.updateProjectionMatrix();
    } else {
      // 3D perspective view
      camera.position.set(6, 4, 6);
      camera.lookAt(0, 0, 0);
      camera.fov = 35;
      camera.updateProjectionMatrix();
    }
  }, [viewMode, camera]);

  // In 2D mode, completely disable camera controls
  if (viewMode === "2D") {
    return null; // No controls in 2D - locked top-down view
  }

  // 3D mode: full controls
  return (
    <CameraControls
      ref={controlsRef}
      enabled={!isDragging}
      minDistance={3}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.1}
    />
  );
}

/**
 * Loading fallback component
 */
function Loader() {
  console.log("[Scene3D] Showing loader...");
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#666'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px'
      }} />
      <div style={{ fontSize: '14px', letterSpacing: '0.1em' }}>LOADING MODELS...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}



/**
 * Scene3D - Main 3D scene component with realistic lighting and shadows
 * @param {Array} modules - Array of sofa modules to render
 * @param {string} viewMode - "2D" or "3D"
 * @param {string} selectedFabric - Currently selected fabric texture path
 * @param {Function} onModuleClick - Callback when a module is clicked
 * @param {Function} onModuleDrag - Callback when a module is dragged
 * @param {string} selectedModuleId - ID of currently selected module
 */
export default function Scene3D({
  modules = [],
  viewMode = "3D",
  selectedFabric = null,
  onModuleClick = () => { },
  onModuleDrag = () => { },
  selectedModuleId = null,
}) {
  const [isDragging, setIsDragging] = useState(false);

  console.log("[Scene3D] Rendering with:", {
    moduleCount: modules.length,
    viewMode,
    selectedFabric,
    modules: modules.map(m => ({ id: m.id, name: m.name, modelPath: m.modelPath }))
  });
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          camera={{ position: [5, 0, 5], fov: 35 }}
          orthographic={viewMode === "2D"}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ background: "#c5c5c5ff" }}
        >
          <TexturePreloader />
          <directionalLight
            position={[3, 8, 3]}
            intensity={0.5}
            castShadow
            shadow-radius={9}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <hemisphereLight
            skyColor="#ffffff"
            groundColor="#888888"
            intensity={0.5}
          />
          <ambientLight intensity={0.3} />


          <CameraManager viewMode={viewMode} isDragging={isDragging} />


          {modules.map((module) => (
            <SofaModule
              key={module.id}
              module={module}
              allModules={modules}
              fabricTexture={selectedFabric}
              isSelected={module.id === selectedModuleId}
              viewMode={viewMode}
              onClick={() => onModuleClick(module)}
              onDragEnd={(position) => onModuleDrag(module.id, position)}
              onDragStart={() => setIsDragging(true)}
              onDragStop={() => setIsDragging(false)}
            />
          ))}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.2} />
          </mesh>

          <Environment preset="city" />
        </Canvas>
      </Suspense>
    </div>
  );
}
