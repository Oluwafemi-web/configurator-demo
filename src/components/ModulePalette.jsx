import React, { useState } from 'react';
import { sofaCatalog } from '../constants';

/**
 * ModulePalette - Display available sofa modules for selection
 * Flexform-style module cards with filtering
 */
export default function ModulePalette({ onModuleSelect, selectedModules = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Get all available modules
  const allModules = sofaCatalog.flatMap((category) => 
    category.items.map((item) => ({
      ...item,
      category: category.category,
    }))
  );

  // Filter modules based on search and category
  const filteredModules = allModules.filter((module) => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || module.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filters
  const categories = ['all', ...new Set(sofaCatalog.map((cat) => cat.category))];

  const handleModuleClick = (module) => {
    onModuleSelect?.(module);
  };

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        className="search-input"
        placeholder="Search modules..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 'var(--space-4)' }}
      />

      {/* Category Filters */}
      <div className="filter-chips">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-chip ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="module-grid">
        {filteredModules.map((module, index) => (
          <div
            key={`${module.name}-${index}`}
            className="module-card"
            onClick={() => handleModuleClick(module)}
          >
            <div className="module-card-image">
              {module.thumbnail ? (
                <img src={module.thumbnail} alt={module.name} />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  style={{ width: '48px', height: '48px', color: 'var(--color-gray-400)' }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              )}
            </div>
            <div className="module-card-content">
              <h3 className="module-card-title">{module.name}</h3>
              <p className="module-card-dimensions">
                {module.dimensionsMetric || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No modules found</p>
          <p className="empty-state-description">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
