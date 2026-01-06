import { useState, useRef, useEffect } from "react";
import Scene3D from "./components/Scene3D";
import PDFExport from "./components/PDFExport";
import {
  STAGES,
  upholsteryCategories,
  sofaCatalog,
} from "./constants";

/**
 * EnhancedConfigurator - New 3D configurator with React Three Fiber
 * Features: Realistic lighting, 2D/3D views, drag-and-drop, snap functionality, fabric selection, PDF export
 */
export default function EnhancedConfigurator() {
  const [stage, setStage] = useState(STAGES.landing);
  const [pendingVariantKeys, setPendingVariantKeys] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState(
    upholsteryCategories[0]?.items[0]?.path || null
  );
  const [viewMode, setViewMode] = useState("3D");
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showComposition, setShowComposition] = useState(false);
  const canvasRef = useRef(null);


  const handleLaunchConfigurator = () => setStage(STAGES.selection);



  const findEmptyPosition = () => {
    // Grid-based placement to avoid overlaps
    const GRID_SIZE = 1.5; // Spacing between modules
    const MAX_SEARCH = 20; // Maximum positions to check

    // Start from origin and spiral outward
    for (let distance = 0; distance < MAX_SEARCH; distance++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const x = Math.cos(angle) * distance * GRID_SIZE;
        const z = Math.sin(angle) * distance * GRID_SIZE;

        // Check if this position overlaps with any existing module
        const hasOverlap = modules.some((m) => {
          const dx = m.position[0] - x;
          const dz = m.position[2] - z;
          const distanceToModule = Math.sqrt(dx * dx + dz * dz);
          return distanceToModule < GRID_SIZE * 0.8; // 80% of grid size for safety
        });

        if (!hasOverlap) {
          return [x, 0, z];
        }
      }
    }

    // Fallback: place far away if no empty spot found
    return [modules.length * 2, 0, 0];
  };

  const handleAddModule = (item) => {
    const newModule = {
      id: Date.now(),
      name: item.name,
      modelPath: item.modelPath,
      connectors: item.connectors || [],
      position: findEmptyPosition(),
      rotation: 0,
    };
    setModules([...modules, newModule]);

  };

  const handleModuleClick = (module) => {


    setSelectedModuleId(module.id);
   

  };

  const handleModuleDrag = (moduleId, newPosition) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, position: newPosition } : m
      )
    );
  };

  const handleRotateModule = () => {
    if (!selectedModuleId) return;
    setModules((prev) =>
      prev.map((m) =>
        m.id === selectedModuleId
          ? { ...m, rotation: (m.rotation + Math.PI / 2) % (Math.PI * 2) }
          : m
      )
    );
  };

  const handleRemoveModule = () => {
    if (!selectedModuleId) return;
    setModules((prev) => prev.filter((m) => m.id !== selectedModuleId));
    setSelectedModuleId(null);
  };

  // Landing Screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedModuleId) {
        handleRemoveModule();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModuleId]);

  return (
    <>
      {/* Landing Screen */}
      <div 
        className="min-h-screen bg-[#e8e6e1] relative flex flex-col"
        style={{ display: stage === STAGES.landing ? 'flex' : 'none' }}
      >
        {/* Top-left "Configurator" text */}
        <div className="absolute top-[30px] left-10 text-[0.95rem] text-[#333] font-normal tracking-[0.02em]">
          Configurator
        </div>

        {/* Main content container */}
        <div className="flex-1 flex items-center justify-between px-[8%] gap-[60px] max-w-[1600px] mx-auto w-full">
          {/* Left side - Text content */}
          <div className="flex-[0_0_auto] max-w-[500px]">
            <h1 className="text-[4.5rem] font-light m-0 mb-5 tracking-[0.08em] leading-[1.1] text-[#1a1a1a]">
              JUMP SOFA
            </h1>
            <p className="text-[0.95rem] leading-[1.7] text-[#4a4a4a] m-0 mb-2.5 font-normal">
              Scopri tutte le configurazioni, cambia forme
            </p>
            <p className="text-[0.95rem] leading-[1.7] text-[#4a4a4a] m-0 mb-[30px] font-normal">
              e materiali.
            </p>
            <p className="text-[0.9rem] leading-[1.7] text-[#666] m-0 mb-10 font-light">
              Osserva il prodotto in ogni dettaglio.
            </p>
            <button
              onClick={handleLaunchConfigurator}
              className="px-8 py-3.5 text-[0.8rem] tracking-[0.15em] border border-[#1a1a1a] bg-transparent text-[#1a1a1a] cursor-pointer font-medium transition-all duration-300 hover:bg-[#1a1a1a] hover:text-white"
            >
              CONFIGURA SISTEMA MODULARE
            </button>
          </div>

          {/* Right side - Sofa image */}
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
              alt="Jump Sofa"
              className="max-w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Selection Screen */}
      <div 
        className="min-h-screen bg-[#e8e6e1] relative flex"
        style={{ display: stage === STAGES.selection ? 'flex' : 'none' }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setStage(STAGES.landing);
          }}
          className="absolute top-5 right-5 w-8 h-8 border-none bg-transparent text-2xl cursor-pointer text-[#333] z-10"
        >
          ✕
        </button>

        {/* Left Panel - Module Categories */}
        <div className="flex-[0_0_55%] p-10 overflow-y-auto max-h-screen">
          <h3 className="text-[0.75rem] tracking-[0.2em] text-[#666] mb-[30px] font-normal">
            MODULE CATEGORIES
          </h3>

          {/* Module Categories Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
            {sofaCatalog.map((category) =>
              category.items.map((item) => {
                const isSelected = selectedItems.find((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItems((prev) => {
                        const exists = prev.find((i) => i.id === item.id);
                        if (exists) {
                          return prev.filter((i) => i.id !== item.id);
                        }
                        return [...prev, item];
                      });
                    }}
                    className={`bg-white ${isSelected ? 'border-2 border-black' : 'border border-[#d0d0d0]'} rounded-lg p-4 cursor-pointer relative transition-all duration-200`}
                  >
                    {/* Checkmark for selected items */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[0.75rem]">
                        ✓
                      </div>
                    )}

                    {/* Module Image */}
                    <div
                      className="w-full h-[120px] bg-contain bg-center bg-no-repeat bg-[#f8f8f8] rounded mb-3"
                      style={{ backgroundImage: `url(${item.thumbnail})` }}
                    />

                    {/* Module Name */}
                    <div className="text-[0.75rem] font-medium text-center text-[#333] tracking-[0.05em]">
                      {item.name.toUpperCase()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Place in Scene Button */}
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                if (selectedItems.length === 0) return;

                const newModules = selectedItems.map((item, index) => ({
                  id: Date.now() + index,
                  name: item.name,
                  modelPath: item.modelPath,
                  connectors: item.connectors || [],
                  position: [index * 1.2, 0, 0],
                  rotation: 0,
                }));

                setModules(newModules);
                setStage(STAGES.builder);
              }}
              disabled={selectedItems.length === 0}
              className={`px-10 py-3.5 text-[0.75rem] tracking-[0.15em] border-none ${selectedItems.length > 0 ? 'bg-black cursor-pointer' : 'bg-[#ccc] cursor-not-allowed'} text-white font-medium transition-all duration-300`}
            >
              PLACE IN THE SCENE
            </button>
          </div>
        </div>

        {/* Right Panel - Filters and Info */}
        <div className="flex-[0_0_45%] py-[60px] px-10 flex flex-col gap-[30px]">
          {/* Title */}
          <h1 className="text-5xl font-light tracking-[0.15em] m-0 text-[#1a1a1a]">
            JUMP SOFA
          </h1>

          {/* Search by product code */}
          <div>
            <label className="block text-[0.7rem] text-[#666] mb-2 tracking-[0.05em]">
              Search by product code
            </label>
            <input
              type="text"
              placeholder=""
              name="search"
              className="w-full py-3 px-4 border border-[#d0d0d0] bg-white text-[0.9rem] outline-none"
            />
          </div>

          {/* Filter by element type */}
          <div>
            <label className="block text-[0.7rem] text-[#666] mb-2 tracking-[0.05em]">
              Filter by element type
            </label>
            <select
              value={selectedCategory || ""}
              name="element_type"
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full py-3 px-4 border border-[#d0d0d0] bg-white text-[0.9rem] outline-none cursor-pointer"
            >
              <option value="">Nothing Selected</option>
              {sofaCatalog.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by width */}
          <div>
            <label className="block text-[0.7rem] text-[#666] mb-2 tracking-[0.05em]">
              Filter by width
            </label>
            <select name="width" className="w-full py-3 px-4 border border-[#d0d0d0] bg-white text-[0.9rem] outline-none cursor-pointer">
              <option>Nothing Selected</option>
            </select>
          </div>

          {/* Filter by depth */}
          <div>
            <label className="block text-[0.7rem] text-[#666] mb-2 tracking-[0.05em]">
              Filter by depth
            </label>
            <select name="depth" className="w-full py-3 px-4 border border-[#d0d0d0] bg-white text-[0.9rem] outline-none cursor-pointer">
              <option>Nothing Selected</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() => setSelectedCategory(null)}
            className="py-3 px-6 text-[0.7rem] tracking-[0.1em] border-none bg-black text-white cursor-pointer font-medium self-start"
          >
            RESET FILTERS
          </button>

          {/* Selected Items Info */}
          {selectedItems.length > 0 && (
            <div className="mt-auto p-5 bg-white rounded-lg border border-[#d0d0d0]">
              <div className="text-[0.8rem] text-[#666] mb-2">
                Selected modules: {selectedItems.length}
              </div>
              <div className="text-[0.75rem] text-[#999]">
                {selectedItems.map((item) => item.name).join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Builder Screen - ALWAYS MOUNTED, visibility controlled by CSS */}
      <div 
        className="min-h-screen bg-[#e8e6e1] relative flex flex-col"
        style={{ display: stage === STAGES.builder ? 'flex' : 'none' }}
      >
        {/* Top-right title */}
        <div className="absolute top-[30px] right-10 text-[2rem] font-light tracking-[0.15em] text-[#1a1a1a] z-10">
          JUMP SOFA
        </div>

        {/* Main container */}
        <div className="flex-1 flex relative">
          {/* Left side - View controls */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-10">
            {/* 3D View Button */}
            <button
              onClick={() => setViewMode("3D")}
              className={`w-10 h-10 rounded-full ${viewMode === "3D" ? 'border-2 border-black bg-black text-white' : 'border border-[#999] bg-white text-black'} cursor-pointer text-[0.7rem] font-bold flex items-center justify-center`}
              title="3D View"
            >
              3D
            </button>

            {/* 2D View Button */}
            <button
              onClick={() => setViewMode("2D")}
              className={`w-10 h-10 rounded-full ${viewMode === "2D" ? 'border-2 border-black bg-black text-white' : 'border border-[#999] bg-white text-black'} cursor-pointer text-[0.7rem] font-bold flex items-center justify-center`}
              title="2D View"
            >
              2D
            </button>
          </div>

          {/* Center - 3D Viewport - ALWAYS RENDERED */}
          <div className="flex-1 flex items-center justify-center p-10">
            <div
              ref={canvasRef}
              className="w-full max-w-[900px] h-[600px] bg-white rounded-lg overflow-hidden"
            >
              <Scene3D
                modules={modules}
                viewMode={viewMode}
                selectedFabric={selectedFabric}
                onModuleClick={handleModuleClick}
                onModuleDrag={handleModuleDrag}
                selectedModuleId={selectedModuleId}
              />
            </div>
          </div>

          {/* Right side - Collapsible panels */}
          <div className="absolute right-10 top-[120px] w-[280px] flex flex-col gap-[15px] z-10">
            {/* ADD MODULE Panel */}
            <div className="bg-white rounded overflow-hidden">
              <button
                onClick={() => setShowAddModule(!showAddModule)}
                className="w-full py-[15px] px-5 border-none bg-transparent text-left cursor-pointer text-[0.75rem] tracking-[0.1em] font-normal flex items-center gap-2.5"
              >
                <span>+</span>
                <span>ADD MODULE</span>
              </button>
              {showAddModule && (
                <div className="py-[15px] px-5 border-t border-[#e0e0e0] max-h-[300px] overflow-y-auto">
                  {sofaCatalog.map((category) => (
                    <div key={category.category} className="mb-5">
                      <div className="text-[0.7rem] font-semibold mb-2.5 text-[#666]">
                        {category.category}
                      </div>
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            handleAddModule(item);
                            setShowAddModule(false);
                          }}
                          className="py-2 cursor-pointer text-[0.75rem] border-b border-[#f0f0f0] hover:bg-[#f8f8f8] transition-colors"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MATERIALS Panel */}
            <div className="bg-white rounded overflow-hidden">
              <button
                onClick={() => setShowMaterials(!showMaterials)}
                className="w-full py-[15px] px-5 border-none bg-transparent text-left cursor-pointer text-[0.75rem] tracking-[0.1em] font-normal flex items-center gap-2.5"
              >
                <span>+</span>
                <span>MATERIALS</span>
              </button>
              {showMaterials && (
                <div className="py-[15px] px-5 border-t border-[#e0e0e0] max-h-[400px] overflow-y-auto">
                  {upholsteryCategories.map((category) => (
                    <div key={category.name} className="mb-6 last:mb-0">
                      <div className="text-[0.7rem] font-semibold mb-3 text-[#666] tracking-wider sticky top-0 bg-white py-1 z-10">
                        {category.name}
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        {category.items.map((texture) => (
                          <div
                            key={texture.id}
                            onClick={() => setSelectedFabric(texture.path)}
                            className={`w-full h-[60px] bg-cover bg-center rounded cursor-pointer ${selectedFabric === texture.path ? 'border-2 border-black' : 'border border-[#e0e0e0]'}`}
                            style={{ backgroundImage: `url("${texture.path}")` }}
                            title={texture.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMPOSITION LIST Panel */}
            <div className="bg-white rounded overflow-hidden">
              <button
                onClick={() => setShowComposition(!showComposition)}
                className="w-full py-[15px] px-5 border-none bg-transparent text-left cursor-pointer text-[0.75rem] tracking-[0.1em] font-normal flex items-center gap-2.5"
              >
                <span>+</span>
                <span>COMPOSITION LIST</span>
              </button>
              {showComposition && (
                <div className="py-[15px] px-5 border-t border-[#e0e0e0]">
                  {modules.length === 0 ? (
                    <div className="text-[0.75rem] text-[#999]">
                      No modules in scene
                    </div>
                  ) : (
                    modules.map((module, index) => (
                      <div
                        key={module.id}
                        onClick={() => setSelectedModuleId(module.id)}
                        className={`py-2 text-[0.75rem] ${index < modules.length - 1 ? 'border-b border-[#f0f0f0]' : ''} cursor-pointer ${selectedModuleId === module.id ? 'bg-[#f8f8f8]' : ''} flex justify-between items-center`}
                      >
                        <span>{module.name}</span>
                        {selectedModuleId === module.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRotateModule();
                              }}
                              className="py-1 px-2 text-[0.65rem] border border-[#ccc] bg-white cursor-pointer rounded-sm"
                            >
                              ↻
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveModule();
                              }}
                              className="py-1 px-2 text-[0.65rem] border border-[#d32f2f] bg-white text-[#d32f2f] cursor-pointer rounded-sm"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="absolute bottom-[30px]  left-1/2 -translate-x-1/2 flex items-center gap-5 bg-white px-5 py-3 rounded shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          {/* Center - Action buttons */}
          <div className="flex gap-[15px] items-center">
            <PDFExport
              canvasRef={canvasRef}
              modules={modules}
              selectedFabric={selectedFabric}
            />
          </div>

          <div className="w-px h-5 bg-[#e0e0e0]" />

          {/* Right side - Request Info button */}
          <div className="flex items-center gap-[15px]">
            {selectedModuleId && (
              <button
                onClick={handleRemoveModule}
                className="py-2 px-5 border-none bg-[#d32f2f] text-white cursor-pointer text-[0.7rem] tracking-[0.1em] font-medium transition-colors hover:bg-[#b71c1c]"
              >
                DELETE
              </button>
            )}
            <button className="py-2 px-5 border-none bg-black text-white cursor-pointer text-[0.7rem] tracking-[0.1em] font-medium">
              REQUEST INFO
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
