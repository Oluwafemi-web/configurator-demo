import { jsPDF } from "jspdf";

/**
 * PDFExport - Component with button to export current configuration as PDF
 * @param {Object} canvasRef - Reference to the Three.js canvas
 * @param {Array} modules - Array of modules in the scene
 * @param {string} selectedFabric - Currently selected fabric
 */
export default function PDFExport({ canvasRef, modules, selectedFabric }) {
  const handleExportPDF = () => {
    if (!canvasRef || !canvasRef.current) {
      alert("Canvas not ready for export");
      return;
    }

    try {
      // Get canvas screenshot
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
      pdf.text("Jump Sofa Configuration", 20, 20);

      // Add screenshot
      const imgWidth = 170;
      const imgHeight = 120;
      pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);

      // Add module list
      pdf.setFontSize(14);
      pdf.text("Modules:", 20, 160);
      
      pdf.setFontSize(10);
      let yPos = 170;
      modules.forEach((module, index) => {
        pdf.text(`${index + 1}. ${module.name}`, 25, yPos);
        yPos += 7;
      });

      // Add fabric info
      if (selectedFabric) {
        pdf.setFontSize(14);
        pdf.text("Selected Fabric:", 20, yPos + 10);
        pdf.setFontSize(10);
        pdf.text(selectedFabric, 25, yPos + 17);
      }

      // Add date
      pdf.setFontSize(8);
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()}`,
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
      
        padding: "12px 24px",
        backgroundColor: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        zIndex: 10,
      }}
    >
      📄 Export PDF
    </button>
  );
}
