import React, { useState } from 'react';
import '../styles/variables.css';
import '../styles/layout.css';
import '../styles/components.css';

/**
 * FlexformLayout - Premium configurator layout wrapper
 * Provides Flexform-style UI structure with sidebar and floating controls
 */
export default function FlexformLayout({ 
  children, 
  onViewModeChange, 
  viewMode = '3d',
  activeAccordion: externalActiveAccordion,
  onAccordionChange,
  modulePaletteContent,
  materialSelectorContent,
  compositionListContent,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [internalActiveAccordion, setInternalActiveAccordion] = useState('modules');

  const activeAccordion = externalActiveAccordion !== undefined ? externalActiveAccordion : internalActiveAccordion;
  
  const toggleAccordion = (section) => {
    const newSection = activeAccordion === section ? null : section;
    if (onAccordionChange) {
      onAccordionChange(newSection);
    } else {
      setInternalActiveAccordion(newSection);
    }
  };

  return (
    <div className="app-container">
      {/* Main Canvas Area */}
      <div className="canvas-container">
        {/* Top Controls */}
        <div className="top-controls">
          <div className="logo">JUMP SOFA</div>
        </div>

        {/* Floating View Controls */}
        <div className="floating-controls">
          {/* View Toggle */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-button ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => onViewModeChange?.('3d')}
              title="3D View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </button>
            <button
              className={`view-toggle-button ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => onViewModeChange?.('2d')}
              title="2D View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <button className="control-button" title="Zoom In">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
            </svg>
          </button>
          <button className="control-button" title="Zoom Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M8 11h6" />
            </svg>
          </button>

          {/* Reset Camera */}
          <button className="control-button" title="Reset View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>

          {/* Screenshot */}
          <button className="control-button" title="Take Screenshot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarCollapsed ? (
              <path d="M15 18l-6-6 6-6" />
            ) : (
              <path d="M9 18l6-6-6-6" />
            )}
          </svg>
        </button>

        {/* Canvas Content */}
        {children}
      </div>

      {/* Right Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Configurator</h1>
          <p className="sidebar-subtitle">Build your perfect sofa</p>
        </div>

        <div className="sidebar-content">
          <div className="accordion">
            {/* Modules Section */}
            <div className={`accordion-item ${activeAccordion === 'modules' ? 'active' : ''}`}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('modules')}
              >
                <span className="accordion-header-title">Modules</span>
                <svg className="accordion-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="accordion-content">
                <div className="accordion-body">
                  {modulePaletteContent || (
                    <>
                      <p className="section-description" style={{ marginBottom: 'var(--space-4)' }}>
                        Select modules to add to your composition
                      </p>
                      <div className="empty-state">
                        <p className="empty-state-title">Module selection</p>
                        <p className="empty-state-description">
                          Module components will appear here
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className={`accordion-item ${activeAccordion === 'materials' ? 'active' : ''}`}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('materials')}
              >
                <span className="accordion-header-title">Materials</span>
                <svg className="accordion-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="accordion-content">
                <div className="accordion-body">
                  {materialSelectorContent || (
                    <>
                      <p className="section-description" style={{ marginBottom: 'var(--space-4)' }}>
                        Choose fabrics and finishes
                      </p>
                      <div className="empty-state">
                        <p className="empty-state-title">Material selection</p>
                        <p className="empty-state-description">
                          Material options will appear here
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Composition Section */}
            <div className={`accordion-item ${activeAccordion === 'composition' ? 'active' : ''}`}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('composition')}
              >
                <span className="accordion-header-title">Composition</span>
                <svg className="accordion-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="accordion-content">
                <div className="accordion-body">
                  {compositionListContent || (
                    <>
                      <p className="section-description" style={{ marginBottom: 'var(--space-4)' }}>
                        Your current configuration
                      </p>
                      <div className="empty-state">
                        <p className="empty-state-title">No modules added</p>
                        <p className="empty-state-description">
                          Add modules to start building
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className={`accordion-item ${activeAccordion === 'export' ? 'active' : ''}`}>
              <button
                className="accordion-header"
                onClick={() => toggleAccordion('export')}
              >
                <span className="accordion-header-title">Export</span>
                <svg className="accordion-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="accordion-content">
                <div className="accordion-body">
                  <div className="flex flex-col gap-3">
                    <button className="btn btn-secondary w-full">
                      <span>Download Image</span>
                    </button>
                    <button className="btn btn-secondary w-full">
                      <span>Export Configuration</span>
                    </button>
                    <button className="btn btn-secondary w-full">
                      <span>Generate PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
