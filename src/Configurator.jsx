import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import { useState, useEffect } from "react";
import { extractColorFromImage } from "./utils/colorExtractor";

function ColorSelector({ label, color, setColor, baseColor }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="color-selector-wrapper"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => setColor(baseColor)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: baseColor,
          cursor: "pointer",
          border:
            color === baseColor && color !== null
              ? "3px solid #000"
              : isHovered
              ? "2px solid #666"
              : "2px solid #ccc",
          transition: "all 0.2s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        title={`Click to apply ${label} color`}
      />
      <span
        className="color-selector-label"
        style={{
          opacity: isHovered ? 1 : 0,
          fontSize: "14px",
          fontWeight: "500",
          color: "#000",
          whiteSpace: "nowrap",
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Configurator() {
  // Base texture URLs - these don't change
  const chairTextureUrl = "/textures/texture01.jpg";
  const pillowTextureUrl = "/textures/texture02.jpg";
  const feetTextureUrl = "/textures/metalfeet.jpg";

  // State for colors extracted from textures (these don't change)
  const [chairBaseColor, setChairBaseColor] = useState("#8B7355");
  const [pillowBaseColor, setPillowBaseColor] = useState("#A0A0A0");
  const [feetBaseColor, setFeetBaseColor] = useState("#C0C0C0");

  // State for currently selected colors (null initially - only set when clicked)
  const [chairColor, setChairColor] = useState(null);
  const [pillowColor, setPillowColor] = useState(null);
  const [feetColor, setFeetColor] = useState(null);
  const [colorsLoaded, setColorsLoaded] = useState(false);

  // Extract colors from textures on mount (but don't apply them)
  useEffect(() => {
    async function loadColors() {
      try {
        const [chair, pillow, feet] = await Promise.all([
          extractColorFromImage(chairTextureUrl),
          extractColorFromImage(pillowTextureUrl),
          extractColorFromImage(feetTextureUrl),
        ]);
        setChairBaseColor(chair);
        setPillowBaseColor(pillow);
        setFeetBaseColor(feet);
        setColorsLoaded(true);
        // Don't set initial selected colors - model will use original textures
      } catch (error) {
        console.error("Error extracting colors:", error);
        setColorsLoaded(true);
      }
    }
    loadColors();
  }, []);

  const colorSelectors = [
    {
      label: "Chair",
      color: chairColor,
      setColor: setChairColor,
      baseColor: chairBaseColor,
    },
    {
      label: "Pillow",
      color: pillowColor,
      setColor: setPillowColor,
      baseColor: pillowBaseColor,
    },
    {
      label: "Feet",
      color: feetColor,
      setColor: setFeetColor,
      baseColor: feetBaseColor,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          margin: "0 0 30px 0",
          fontSize: "2.5rem",
          fontWeight: "600",
          color: "#000000",
        }}
      >
        Configurator
      </h1>

      <div
        className="configurator-container"
        style={{
          display: "flex",
          width: "90%",
          maxWidth: "1200px",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left side: color selectors */}
        <div
          className="color-selectors-panel"
          style={{
            width: "120px",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            backgroundColor: "#fafafa",
          }}
        >
          {colorSelectors.map((selector, i) => (
            <ColorSelector
              key={i}
              label={selector.label}
              color={selector.color}
              setColor={selector.setColor}
              baseColor={selector.baseColor}
            />
          ))}
        </div>

        {/* Right side: 3D scene */}
        <div className="canvas-container" style={{ flex: 1, height: "600px" }}>
          <Canvas camera={{ position: [2, 2, 2], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 3, 3]} intensity={0.5} />

            {/* Model with separate colors */}
            {colorsLoaded && (
              <Model
                chairColor={chairColor}
                pillowColor={pillowColor}
                feetColor={feetColor}
              />
            )}

            <OrbitControls
              enablePan={true}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(2 * Math.PI) / 4}
            />
            <Environment preset="apartment" />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
