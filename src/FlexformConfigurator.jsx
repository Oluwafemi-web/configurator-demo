import React, { useState } from 'react';
import FlexformLayout from './components/FlexformLayout';
import ModulePalette from './components/ModulePalette';
import MaterialSelector from './components/MaterialSelector';
import CompositionList from './components/CompositionList';
import Configurator from './Configurator';
import './index.css';

/**
 * FlexformConfigurator - Main wrapper integrating Flexform UI with existing configurator
 */
export default function FlexformConfigurator() {
  const [viewMode, setViewMode] = useState('3d');
  const [activeAccordion, setActiveAccordion] = useState('modules');
  const [chairs, setChairs] = useState([]);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState({
    chair: null,
    pillow: null,
    feet: null,
  });

  const handleModuleSelect = (module) => {
    // Determine position based on model path
    const getPosition = (modelPath = '') => {
      const upperPath = modelPath.toUpperCase();
      if (upperPath.includes('CENTER')) return 'center';
      if (upperPath.includes('DX')) return 'left';
      if (upperPath.includes('SX')) return 'right';
      return 'right';
    };

    const newChair = {
      id: Date.now(),
      sofa: module,
      chairTexture: selectedMaterials.chair?.path || null,
      pillowTexture: selectedMaterials.pillow?.path || null,
      feetTexture: selectedMaterials.feet?.path || null,
      position: getPosition(module.modelPath),
      customPosition: null,
      rotation: 0,
      meshWidth: null,
    };

    setChairs((prev) => {
      if (newChair.position === 'left') {
        return [newChair, ...prev];
      } else {
        return [...prev, newChair];
      }
    });

    // Auto-switch to composition view
    setActiveAccordion('composition');
  };

  const handleMaterialSelect = (part, material, applyToAll) => {
    setSelectedMaterials((prev) => ({
      ...prev,
      [part]: material,
    }));

    if (applyToAll) {
      // Apply to all existing chairs
      setChairs((prev) =>
        prev.map((chair) => ({
          ...chair,
          [`${part}Texture`]: material.path,
        }))
      );
    } else if (selectedChairId) {
      // Apply to selected chair only
      setChairs((prev) =>
        prev.map((chair) =>
          chair.id === selectedChairId
            ? { ...chair, [`${part}Texture`]: material.path }
            : chair
        )
      );
    }
  };

  const handleModuleRemove = (moduleId) => {
    setChairs((prev) => prev.filter((chair) => chair.id !== moduleId));
    if (selectedChairId === moduleId) {
      setSelectedChairId(null);
    }
  };

  const handleModuleSelectInList = (moduleId) => {
    setSelectedChairId(moduleId);
  };

  return (
    <FlexformLayout
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      activeAccordion={activeAccordion}
      onAccordionChange={setActiveAccordion}
      modulePaletteContent={
        <ModulePalette
          onModuleSelect={handleModuleSelect}
          selectedModules={chairs}
        />
      }
      materialSelectorContent={
        <MaterialSelector
          onMaterialSelect={handleMaterialSelect}
          selectedMaterials={selectedMaterials}
          availableParts={['chair', 'pillow', 'feet']}
        />
      }
      compositionListContent={
        <CompositionList
          modules={chairs}
          selectedModuleId={selectedChairId}
          onModuleSelect={handleModuleSelectInList}
          onModuleRemove={handleModuleRemove}
        />
      }
    >
      {/* Existing Configurator Canvas */}
      <Configurator
        externalChairs={chairs}
        onChairsChange={setChairs}
        externalViewMode={viewMode}
        externalSelectedChairId={selectedChairId}
        onSelectedChairIdChange={setSelectedChairId}
      />
    </FlexformLayout>
  );
}
