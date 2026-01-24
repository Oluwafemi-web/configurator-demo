import { jsPDF } from "jspdf";
import { upholsteryTextures } from "../constants";
import { calculateCompositionDimensions } from "../utils/configurator/calculateDimensions";

/**
 * PDFExport - Component with button to export current configuration as PDF
 * @param {Object} canvasRef - Reference to the Three.js canvas container
 * @param {Array} modules - Array of chair modules in the scene
 * @param {string} selectedFabric - Currently selected fabric (legacy prop)
 * @param {Function} setIsExporting - Function to set exporting state (hides UI elements)
 * @param {Function} getResolvedPosition - Function to calculate positions
 */
export default function PDFExport({ canvasRef, modules = [], selectedFabric, setIsExporting, getResolvedPosition }) {

    // Helper to find fabric label from path
    const getFabricLabel = (fabricPath) => {
        if (!fabricPath) return "Not selected";
        for (const category of upholsteryTextures) {
            const found = category.fabrics.find(f => f.path === fabricPath);
            if (found) return found.label;
        }
        return "Custom";
    };

    const handleExportPDF = () => {
        if (!canvasRef || !canvasRef.current) {
            alert("Canvas not ready for export");
            return;
        }

        // 1. Set exporting state to true (hides dimension lines)
        if (setIsExporting) setIsExporting(true);

        // 2. Wait for React to render the changes (hide lines)
        setTimeout(() => {
            try {
                // Get canvas screenshot from the container
                let canvas = canvasRef.current;
                if (canvas.tagName !== "CANVAS") {
                    canvas = canvas.querySelector("canvas");
                }

                if (!canvas) {
                    throw new Error("Could not find canvas element");
                }

                const imgData = canvas.toDataURL("image/png");

                // Create PDF
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                });

                // Add title
                pdf.setFontSize(20);
                pdf.text("JUMP SOFA Configuration", 20, 20);

                // Add screenshot
                const imgWidth = 170;
                const imgHeight = 120;
                pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);

                // Calculate total dimensions
                const compositionDims = calculateCompositionDimensions(modules, getResolvedPosition);

                // Add dimensions text below image
                if (compositionDims) {
                    pdf.setFontSize(12);
                    pdf.setFont(undefined, "bold");
                    const w = Math.round(compositionDims.width * 100);
                    const d = Math.round(compositionDims.depth * 100);
                    const h = Math.round(compositionDims.height * 100);
                    pdf.text(`Total Dimensions: W ${w} cm x D ${d} cm x H ${h} cm`, 20, 155);
                }

                // Add composition details
                pdf.setFontSize(14);
                pdf.setFont(undefined, "normal");
                pdf.text("Composition:", 20, 165);

                if (modules.length === 0) {
                    pdf.setFontSize(10);
                    pdf.text("No modules added", 25, 175);
                } else {
                    pdf.setFontSize(10);
                    let yPos = 175;

                    modules.forEach((chair, index) => {
                        // Module name and code
                        const fabricLabel = getFabricLabel(chair.chairTexture || selectedFabric);

                        pdf.setFont(undefined, "bold");
                        // Assuming the ID is the code, otherwise use chair.sofa.id
                        const code = chair.sofa.id.toUpperCase();
                        pdf.text(`${index + 1}. ${chair.sofa?.name || "Module"}`, 25, yPos);

                        // Add Code on the same line or next
                        pdf.setFont(undefined, "normal");
                        pdf.text(`Code: ${code}`, 100, yPos);
                        yPos += 5;

                        // Fabric
                        pdf.text(`Fabric: ${fabricLabel}`, 25, yPos);
                        yPos += 5;

                        // Dimensions
                        if (chair.sofa?.dimensionsMetric) {
                            pdf.text(`Dims: ${chair.sofa.dimensionsMetric}`, 25, yPos);
                            yPos += 5;
                        }

                        yPos += 3; // Spacing

                        // Check if we need a new page
                        if (yPos > 270) {
                            pdf.addPage();
                            yPos = 20;
                        }
                    });
                }

                // Add date and timestamp
                pdf.setFontSize(8);
                pdf.setFont(undefined, "normal");
                const now = new Date();
                pdf.text(
                    `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
                    20,
                    285
                );

                // Open PDF in new tab
                window.open(pdf.output("bloburl"), "_blank");
            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("Failed to generate PDF. Please try again.");
            } finally {
                // 3. Restore export state (show dimension lines if they were enabled)
                if (setIsExporting) setIsExporting(false);
            }
        }, 100); // 100ms delay to allow render cycle
    };

    return (
        <button
            onClick={handleExportPDF}
            style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontSize: "11px",
                transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
                e.target.style.background = "#f5f5f5";
                e.target.style.borderColor = "#999";
            }}
            onMouseLeave={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#ccc";
            }}
            title="Export PDF"
        >
            EXPORT PDF
        </button>
    );
}