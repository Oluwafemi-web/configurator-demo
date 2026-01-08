import { jsPDF } from "jspdf";

/**
 * PDFExport - Component with button to export current configuration as PDF
 * @param {Object} canvasRef - Reference to the Three.js canvas container
 * @param {Array} modules - Array of chair modules in the scene
 * @param {string} selectedFabric - Currently selected fabric (legacy prop)
 */
export default function PDFExport({ canvasRef, modules = [], selectedFabric }) {
    const handleExportPDF = () => {
        if (!canvasRef || !canvasRef.current) {
            alert("Canvas not ready for export");
            return;
        }

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

            // Add composition details
            pdf.setFontSize(14);
            pdf.text("Composition:", 20, 160);

            if (modules.length === 0) {
                pdf.setFontSize(10);
                pdf.text("No modules added", 25, 170);
            } else {
                pdf.setFontSize(10);
                let yPos = 170;

                modules.forEach((chair, index) => {
                    // Module name and dimensions
                    pdf.setFont(undefined, "bold");
                    pdf.text(`${index + 1}. ${chair.sofa?.name || "Module"}`, 25, yPos);
                    yPos += 5;

                    // Dimensions
                    if (chair.sofa?.dimensionsMetric) {
                        pdf.setFont(undefined, "normal");
                        pdf.text(`   ${chair.sofa.dimensionsMetric}`, 25, yPos);
                        yPos += 5;
                    }

                    // Position/Type
                    if (chair.position) {
                        pdf.setFont(undefined, "italic");
                        pdf.text(`   Position: ${chair.position}`, 25, yPos);
                        yPos += 5;
                    }

                    yPos += 2; // Extra spacing between modules

                    // Check if we need a new page
                    if (yPos > 260) {
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
                280
            );

            // Open PDF in new tab
            window.open(pdf.output("bloburl"), "_blank");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        }
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