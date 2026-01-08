import { useState } from "react";

export default function Palette({
    label,
    options = [],
    selectedOptionId,
    onSelect,
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if options are grouped (for upholstery) or flat (for feet)
    const isGrouped = options.length > 0 && options[0]?.category;

    // Get all fabrics for preview and selection
    const allFabrics = isGrouped
        ? options.flatMap((group) => group.fabrics || [])
        : options;

    // Get the preview texture - use selected one if available, otherwise first option
    const previewTexture =
        allFabrics.find((opt) => opt.id === selectedOptionId) || allFabrics[0];
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
                        <span className="relative rounded-full flex items-center justify-center text-xl text-black">
                            {isExpanded ? "−" : "+"}
                        </span>
                    )}
                </button>
                <span className="text-sm uppercase text-gray-800 font-medium">
                    {label}
                </span>
            </div>
            {isExpanded && (
                <div className="w-full max-h-[500px] overflow-y-auto pr-2">
                    {isGrouped ? (
                        // Grouped display for upholstery fabrics
                        <div className="flex flex-col gap-6">
                            {options.map((group) => (
                                <div key={group.category}>
                                    <h3 className="text-xs uppercase tracking-wide text-gray-600 mb-3 font-medium">
                                        {group.category}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {group.fabrics.map((fabric) => (
                                            <div
                                                key={fabric.id}
                                                className="flex flex-col items-center gap-1 cursor-pointer"
                                                onClick={() => onSelect(fabric)}
                                            >
                                                <div
                                                    className="color-selector-circle"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        backgroundImage: `url(${encodeURI(fabric.path)})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                        border:
                                                            selectedOptionId === fabric.id
                                                                ? "3px solid #000"
                                                                : "2px solid #ccc",
                                                        borderRadius: "4px",
                                                    }}
                                                    title={fabric.label}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Flat display for feet textures
                        <div className="grid grid-cols-3 gap-2">
                            {options.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex flex-col items-center gap-1 cursor-pointer"
                                    onClick={() => onSelect(option)}
                                >
                                    <div
                                        className="color-selector-circle"
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            backgroundImage: `url(${option.path})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            border:
                                                selectedOptionId === option.id
                                                    ? "3px solid #000"
                                                    : "2px solid #ccc",
                                            borderRadius: "4px",
                                        }}
                                        title={option.label}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}