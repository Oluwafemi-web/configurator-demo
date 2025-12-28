import React, { useState } from 'react';
import { upholsteryTextures, feetTextures } from '../constants';

/**
 * MaterialSelector - Fabric and material selection component
 * Flexform-style material swatches with categories
 */
export default function MaterialSelector({ 
  onMaterialSelect, 
  selectedMaterials = {},
  availableParts = ['chair', 'pillow', 'feet']
}) {
  const [activeCategory, setActiveCategory] = useState('chair');
  const [applyToAll, setApplyToAll] = useState(true);

  const getMaterialOptions = (part) => {
    if (part === 'feet') return feetTextures;
    return upholsteryTextures;
  };

  const handleMaterialClick = (part, material) => {
    onMaterialSelect?.(part, material, applyToAll);
  };

  const renderMaterialGrid = (part) => {
    const materials = getMaterialOptions(part);
    const selectedId = selectedMaterials[part]?.id;

    return (
      <div>
        <div className="material-grid">
          {materials.map((material) => (
            <div
              key={material.id}
              className={`material-swatch ${selectedId === material.id ? 'selected' : ''}`}
              onClick={() => handleMaterialClick(part, material)}
              title={material.name || material.id}
            >
              {material.path ? (
                <img src={material.path} alt={material.name || material.id} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: material.color || 'var(--color-gray-300)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Apply to All Toggle */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}
      >
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-700)' }}>
          Apply to all modules
        </span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            style={{ marginRight: 'var(--space-2)' }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)' }}>
            {applyToAll ? 'All' : 'Selected only'}
          </span>
        </label>
      </div>

      {/* Part Tabs */}
      {availableParts.length > 0 && (
        <>
          <div className="filter-chips" style={{ marginBottom: 'var(--space-4)' }}>
            {availableParts.map((part) => (
              <button
                key={part}
                className={`filter-chip ${activeCategory === part ? 'active' : ''}`}
                onClick={() => setActiveCategory(part)}
              >
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </button>
            ))}
          </div>

          {/* Material Grid */}
          <div className="section-header">
            <h3 className="section-title">
              {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Materials
            </h3>
            <p className="section-description">
              Select a material to apply
            </p>
          </div>

          {renderMaterialGrid(activeCategory)}
        </>
      )}

      {/* Empty State */}
      {availableParts.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No materials available</p>
          <p className="empty-state-description">
            Add modules to customize materials
          </p>
        </div>
      )}
    </div>
  );
}
