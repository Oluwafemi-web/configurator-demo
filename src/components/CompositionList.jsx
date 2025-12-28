import React from 'react';

/**
 * CompositionList - Display current sofa composition
 * List of all modules in the configuration with actions
 */
export default function CompositionList({ 
  modules = [], 
  selectedModuleId,
  onModuleSelect,
  onModuleRemove,
  onModuleReorder
}) {
  const handleRemove = (moduleId, event) => {
    event.stopPropagation();
    onModuleRemove?.(moduleId);
  };

  const getTotalDimensions = () => {
    if (modules.length === 0) return null;
    
    // Calculate total width (simplified - assumes linear arrangement)
    let totalWidth = 0;
    modules.forEach((module) => {
      const metric = module.sofa?.dimensionsMetric || '';
      const width = parseFloat(metric.split('x')[0]) || 0;
      totalWidth += width;
    });

    return `${totalWidth.toFixed(0)} cm total width`;
  };

  const totalDimensions = getTotalDimensions();

  return (
    <div>
      {/* Summary */}
      {modules.length > 0 && (
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
              </p>
              {totalDimensions && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', margin: 'var(--space-1) 0 0 0' }}>
                  {totalDimensions}
                </p>
              )}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => modules.forEach((m) => onModuleRemove?.(m.id))}
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Module List */}
      <div className="composition-list">
        {modules.map((module, index) => (
          <div
            key={module.id}
            className={`composition-item ${selectedModuleId === module.id ? 'selected' : ''}`}
            onClick={() => onModuleSelect?.(module.id)}
          >
            <div className="composition-item-thumbnail">
              {module.sofa?.thumbnail ? (
                <img src={module.sofa.thumbnail} alt={module.sofa.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-gray-200)' }} />
              )}
            </div>

            <div className="composition-item-info">
              <p className="composition-item-name">
                {module.sofa?.name || `Module ${index + 1}`}
              </p>
              <p className="composition-item-details">
                {module.sofa?.dimensionsMetric || 'N/A'}
                {module.chairTexture && ' • Custom material'}
              </p>
            </div>

            <div className="composition-item-actions">
              <button
                className="icon-button"
                onClick={(e) => handleRemove(module.id, e)}
                title="Remove module"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && (
        <div className="empty-state">
          <svg
            className="empty-state-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="empty-state-title">No modules added</p>
          <p className="empty-state-description">
            Add modules from the Modules section to start building your sofa
          </p>
        </div>
      )}
    </div>
  );
}
