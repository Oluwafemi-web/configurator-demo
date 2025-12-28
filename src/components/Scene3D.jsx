import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import CameraController from "./CameraController";
import FloorPlane from "./FloorPlane";
import SofaModule from "./SofaModule";
import { upholsteryCategories } from "../constants";
import { useTexture } from "@react-three/drei";

// Preload all textures to avoid suspense/blink during selection
const TexturePreloader = () => {
  upholsteryCategories.forEach((category) => {
    category.items.forEach((item) => {
      useTexture.preload(item.path);
    });
  });
  return null;
};

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

  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 8], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }} // Required for PDF screenshot export
      style={{ background: "#f0f0f0" }}
    >
      <TexturePreloader />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      {/* Fill light to soften shadows */}
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />

      {/* Hemisphere light for realistic sky/ground ambient */}
      <hemisphereLight args={["#ffffff", "#444444", 0.5]} />

      {/* Camera controls with floor constraint */}
      <CameraController viewMode={viewMode} isDragging={isDragging} />

      {/* Fixed floor plane */}
      <FloorPlane />

      {/* Render all sofa modules */}
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
    </Canvas>
  );
}
