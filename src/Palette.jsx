import { useState } from "react";

export default function Palette({
  label,
  options = [],
  selectedOptionId,
  onSelect,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the preview texture - use selected one if available, otherwise first option
  const previewTexture =
    options.find((opt) => opt.id === selectedOptionId) || options[0];
  const previewPath = previewTexture?.path || null;

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center text-lg text-gray-700 bg-white relative overflow-hidden"
          style={{
            backgroundImage: previewPath ? `url(${previewPath})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label={isExpanded ? "Nascondi palette" : "Mostra palette"}
        >
          {!previewPath && (
            <span className="relative z-10">{isExpanded ? "−" : "+"}</span>
          )}
          {previewPath && (
            <span className="relative  rounded-full flex items-center justify-center text-xl text-white">
              {isExpanded ? "−" : "+"}
            </span>
          )}
        </button>
        <span className="text-sm uppercase text-gray-800 font-medium">
          {label}
        </span>
      </div>
      {isExpanded && (
        <div className="w-full">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3 text-center">
            SCELTE TROVATE {options.length}
          </p>
          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => {
                  onSelect(option);
                  setIsExpanded(false);
                }}
              >
                <div
                  className="color-selector-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundImage: `url(${option.path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border:
                      selectedOptionId === option.id
                        ? "3px solid #000"
                        : "2px solid #ccc",
                  }}
                  title={option.label}
                />
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-600 text-center">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
