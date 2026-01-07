export const STAGES = {
  landing: "landing",
  selection: "selection",
  builder: "builder",
};

export const upholsteryTextures = [
  {
    id: "beige-upholstery",
    label: "Beige_ulphostery",
    path: "/textures/Ulphostery/Beige_ulphostery.jpg",
  },
  {
    id: "black-upholstery",
    label: "Black_ulphostery",
    path: "/textures/Ulphostery/Black_ulphostery.jpg",
  },
  {
    id: "blue-midnight-upholstery",
    label: "Blu_Midnight_ulphostery",
    path: "/textures/Ulphostery/Blu_Midnight_ulphostery.jpg",
  },
  {
    id: "blue-upholstery",
    label: "Blu_ulphostery",
    path: "/textures/Ulphostery/Blu_ulphostery.jpg",
  },
  {
    id: "gray-upholstery",
    label: "Gray_ulphostery",
    path: "/textures/Ulphostery/Gray_ulphostery.jpg",
  },
  {
    id: "red-upholstery",
    label: "Red_ulphostery",
    path: "/textures/Ulphostery/Red_ulphostery.jpg",
  },
  {
    id: "white-upholstery",
    label: "White_ulphostery",
    path: "/textures/Ulphostery/White_ulphostery.jpg",
  },
  {
    id: "yellow-upholstery",
    label: "Yellow_ulphostery",
    path: "/textures/Ulphostery/Yellow_ulphostery.jpg",
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
    category: "POLTRONA",
    items: [
      {
        id: "02D301",
        name: "02D301",
        description: "Modulo singolo",
        dimensionsMetric: "92 x 114 x 70 CM",
        dimensionsImperial: '36 1/4" x 44 7/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_CENTER.glb",
        fabricGroup: "POLTORONA",
      },
    ],
  },
  {
    category: "DIVANO",
    items: [
      {
        id: "02D303",
        name: "02D303",
        description: "Modulo DX",
        dimensionsMetric: "114 x 215 x 70 CM",
        dimensionsImperial: '44 7/8" x 84 5/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_DX.glb",
        fabricGroup: "DIVANO",
      },
    ],
  },
  {
    category: "ELEMENTO",
    items: [
      {
        id: "02D305",
        name: "02D305",
        description: "Modulo SX",
        dimensionsMetric: "114 x 265 x 70 CM",
        dimensionsImperial: '44 7/8" x 104 3/8" x 27 1/2"',
        modelPath: "/models/Jump_Sofa_GLB/Jump_Sofa_SX.glb",
        fabricGroup: "ELEMENTO",
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
    image: "/frontimage/Icon_Jump_CENTER_element.png",
  },
  {
    key: "left",
    title: "Modulo Sinistro",
    description: "Terminale sinistro (modello DX).",
    badge: "DX",
    image: "/frontimage/Icon_Jump_LEFT_element.png",
  },
  {
    key: "right",
    title: "Modulo Destro",
    description: "Terminale destro (modello SX).",
    badge: "SX",
    image: "/frontimage/Icon_Jump_RIGHT_element.png",
  },
];
