import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import { useState } from "react";

export default function Configurator() {
  const [texture, setTexture] = useState("/textures/texture01.jpg");

  const textures = [
    "/textures/texture01.jpg",
    "/textures/texture02.jpg",
    "/textures/metalfeet.jpg",
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side: texture options */}
      <div
        style={{
          width: "100px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {textures.map((tex, i) => (
          <div
            key={i}
            onClick={() => setTexture(tex)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundImage: `url(${tex})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              border: texture === tex ? "3px solid black" : "2px solid #ccc",
            }}
          />
        ))}
      </div>

      {/* Right side: 3D scene */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [2, 2, 2], fov: 45 }} width="100%">
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 3, 3]} intensity={0.5} />

          {/* Model with selected texture */}
          <Model textureURL={texture} />

          <OrbitControls enablePan={true} />
          <Environment preset="studio" />
        </Canvas>
      </div>
    </div>
  );
}
