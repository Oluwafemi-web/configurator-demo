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
      camera.fov =35;
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
 * Error fallback component
 */
function ErrorFallback({ error }) {
  console.error("[Scene3D] Error rendering scene:", error);
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#d32f2f',
      padding: '20px'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        Failed to load 3D models
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {error?.message || 'Unknown error'}
      </div>
      <div style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
        Check browser console for details
      </div>
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
  onModuleClick = () => {},
  onModuleDrag = () => {},
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
          // gl={{ preserveDrawingBuffer: true }} // DISABLED for performance/memory optimization 
          style={{ background: "#c5c5c5ff" }}
        >
          <TexturePreloader />
\
          <ambientLight intensity={Math.PI} />


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

          <Environment preset="city" />
        </Canvas>
      </Suspense>
    </div>
  );
}
