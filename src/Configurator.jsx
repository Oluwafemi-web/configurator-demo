import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/models/TEST.glb");
  return <primitive object={scene} scale={1} />;
}

export default function Configurator() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        {/* Smooth lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Your Model */}
        <Model />

        {/* Controls (rotate, zoom) */}
        <OrbitControls enablePan={false} />

        {/* Nice HDRI background */}
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
