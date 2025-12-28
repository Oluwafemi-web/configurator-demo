export const STAGES = {
  landing: "landing",
  selection: "selection",
  builder: "builder",
};

export const upholsteryCategories = [
  {
    name: "EDEN FABRIC",
    items: [
      { id: "eden-332", label: "EDEN 332", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.332 EDEN_01c_tx.jpg" },
      { id: "eden-335", label: "EDEN 335", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.335 EDEN_02c_tx.jpg" },
      { id: "eden-338", label: "EDEN 338", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.338 EDEN_04c_tx.jpg" },
      { id: "eden-341", label: "EDEN 341", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.341 EDEN_07c_tx.jpg" },
      { id: "eden-344", label: "EDEN 344", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.344 EDEN_05c_tx.jpg" },
      { id: "eden-347", label: "EDEN 347", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.347 EDEN_21c_tx.jpg" },
      { id: "eden-350", label: "EDEN 350", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.350 EDEN_19c_tx.jpg" },
      { id: "eden-353", label: "EDEN 353", path: "/models/JUMP_SOFA/ULPHOSTERY/EDEN_FABRIC/cat. B n.353 EDEN_23c_tx.jpg" },
    ]
  },
  {
    name: "NORA FABRIC",
    items: [
      { id: "nora-333", label: "NORA 333", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.333 NORA_01c_tx.jpg" },
      { id: "nora-336", label: "NORA 336", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.336 NORA_02c_tx.jpg" },
      { id: "nora-337", label: "NORA 337", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.337 NORA_03c_tx.jpg" },
      { id: "nora-340", label: "NORA 340", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.340 NORA_04c_tx.jpg" },
      { id: "nora-343", label: "NORA 343", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.343 NORA_06c_tx.jpg" },
      { id: "nora-345", label: "NORA 345", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.345 NORA_21c_tx.jpg" },
      { id: "nora-348", label: "NORA 348", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.348 NORA_23c_tx.jpg" },
      { id: "nora-351", label: "NORA 351", path: "/models/JUMP_SOFA/ULPHOSTERY/NORA_FABRIC/cat. B n.351 NORA_26c_tx.jpg" },
    ]
  },
  {
    name: "PINKY FABRIC",
    items: [
      { id: "pinky-330", label: "PINKY 330", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.330 PINKY_01c_tx.jpg" },
      { id: "pinky-331", label: "PINKY 331", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.331 PINKY_02c_tx.jpg" },
      { id: "pinky-334", label: "PINKY 334", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.334 PINKY_04c_tx.jpg" },
      { id: "pinky-339", label: "PINKY 339", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.339 PINKY_06c_tx.jpg" },
      { id: "pinky-342", label: "PINKY 342", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.342 PINKY_08c_tx.jpg" },
      { id: "pinky-346", label: "PINKY 346", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.346 PINKY_22c_tx.jpg" },
      { id: "pinky-349", label: "PINKY 349", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.349 PINKY_23c_tx.jpg" },
      { id: "pinky-352", label: "PINKY 352", path: "/models/JUMP_SOFA/ULPHOSTERY/PINKY_FABRIC/cat. B n.352 PINKY_25c_tx.jpg" },
    ]
  },
];

export const feetTextures = [
  {
    id: "metal-texture",
    label: "METAL",
    path: "/textures/metal_texture_FEET.jpg",
  },
  {
    id: "wood-texture",
    label: "WOOD",
    path: "/textures/Wood_texture_FEET.jpg",
  },
];

export const SOFA_FAMILY_NAME = "Jump Sofa";

export const sofaCatalog = [
  {
    category: "Seats",
    items: [
      {
        id: "jump-center",
        name: "Jump Center",
        description: "Center seat module",
        dimensionsMetric: "114 x 114 x 70 cm",
        dimensionsImperial: '44 7/8" x 44 7/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_Center.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Center.png",
        fabricGroup: "Seats",
        connectors: [
          { x: 0.57, z: 0 },   // Right
          { x: -0.57, z: 0 },  // Left
          { x: 0, z: 0.57 },   // Front
          { x: 0, z: -0.57 }   // Back
        ]
      },
      {
        id: "jump-bigseat",
        name: "Jump Big Seat",
        description: "Oversized seat module",
        dimensionsMetric: "140 x 140 x 70 cm",
        dimensionsImperial: '55 1/8" x 55 1/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_BigSeat.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_BigSeat.png",
        fabricGroup: "Seats",
        connectors: [
          { x: 0.70, z: 0 },   // Right
          { x: -0.70, z: 0 },  // Left
          { x: 0, z: 0.70 },   // Front
          { x: 0, z: -0.70 }   // Back
        ]
      },
    ],
  },
  {
    category: "Arms",
    items: [
      {
        id: "jump-left",
        name: "Jump Left",
        description: "Left armrest module",
        dimensionsMetric: "92 x 114 x 70 cm",
        dimensionsImperial: '36 1/4" x 44 7/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_Left.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Left.png",
        fabricGroup: "Arms",
        connectors: [
          { x: 0.46, z: 0 }    // Right (connects to seat)
        ]
      },
      {
        id: "jump-right",
        name: "Jump Right",
        description: "Right armrest module",
        dimensionsMetric: "92 x 114 x 70 cm",
        dimensionsImperial: '36 1/4" x 44 7/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_Right.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Right.png",
        fabricGroup: "Arms",
        connectors: [
          { x: -0.46, z: 0 }   // Left (connects to seat)
        ]
      },
    ],
  },
  {
    category: "Corners",
    items: [
      {
        id: "jump-angle",
        name: "Jump Angle",
        description: "Corner angle module",
        dimensionsMetric: "114 x 114 x 70 cm",
        dimensionsImperial: '44 7/8" x 44 7/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_Angle.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Angle.png",
        fabricGroup: "Corners",
        connectors: [
          { x: 0.57, z: 0 },   // Right
          { x: -0.57, z: 0 },  // Left
          { x: 0, z: 0.57 },   // Front
          { x: 0, z: -0.57 }   // Back
        ]
      },
      {
        id: "jump-bigangle",
        name: "Jump Big Angle",
        description: "Large corner module",
        dimensionsMetric: "140 x 140 x 70 cm",
        dimensionsImperial: '55 1/8" x 55 1/8" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_BigAngle.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_BigAngle.png",
        fabricGroup: "Corners",
        connectors: [
          { x: 0.70, z: 0 },   // Right
          { x: -0.70, z: 0 },  // Left
          { x: 0, z: 0.70 },   // Front
          { x: 0, z: -0.70 }   // Back
        ]
      },
    ],
  },
  {
    category: "Poufs",
    items: [
      {
        id: "jump-pouf",
        name: "Jump Pouf",
        description: "Ottoman module",
        dimensionsMetric: "92 x 92 x 40 cm",
        dimensionsImperial: '36 1/4" x 36 1/4" x 15 3/4"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_Pouf.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Pouf.png",
        fabricGroup: "Poufs",
        connectors: [
          { x: 0.46, z: 0 },
          { x: -0.46, z: 0 },
          { x: 0, z: 0.46 },
          { x: 0, z: -0.46 }
        ]
      },
      {
        id: "jump-seatpouf",
        name: "Jump Seat Pouf",
        description: "Seat with integrated pouf",
        dimensionsMetric: "114 x 92 x 70 cm",
        dimensionsImperial: '44 7/8" x 36 1/4" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_SeatPouf.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_SeatPouf.png",
        fabricGroup: "Poufs",
        connectors: [
          { x: 0.57, z: 0 },   // Right
          { x: -0.57, z: 0 },  // Left
          { x: 0, z: 0.46 },   // Front
          { x: 0, z: -0.46 }   // Back
        ]
      },
      {
        id: "jump-chaisepouf",
        name: "Jump Chaise Pouf",
        description: "Chaise lounge with pouf",
        dimensionsMetric: "114 x 165 x 70 cm",
        dimensionsImperial: '44 7/8" x 64 15/16" x 27 1/2"',
        modelPath: "/models/JUMP_SOFA/3D_MODELS/Jump_ChaisePouf.gltf",
        thumbnail: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_ChaisePouf.png",
        fabricGroup: "Poufs",
        connectors: [
          { x: 0.57, z: 0 },   // Right
          { x: -0.57, z: 0 }   // Left
        ]
      },
    ],
  },
];

export const VARIANT_CONFIG = [
  {
    key: "center",
    title: "Modulo Centrale",
    description: "Elemento centrale per creare sezioni lineari.",
    badge: "CENTER",
    image: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Center.png",
  },
  {
    key: "left",
    title: "Modulo Sinistro",
    description: "Terminale sinistro (modello DX).",
    badge: "DX",
    image: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Left.png",
  },
  {
    key: "right",
    title: "Modulo Destro",
    description: "Terminale destro (modello SX).",
    badge: "SX",
    image: "/models/JUMP_SOFA/SCREENSHOR_Dimensions/Jump_Right.png",
  },
];
