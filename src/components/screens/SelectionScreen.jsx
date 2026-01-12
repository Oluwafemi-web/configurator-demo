import { SOFA_FAMILY_NAME } from "../../constants";

/**
 * SelectionScreen Component
 * Displays module selection grid organized by categories
 */
export default function SelectionScreen({
    pendingVariantKeys,
    setPendingVariantKeys,
    onBack,
    onConfirm,
    sofaCatalog,
    getItemImagePath,
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f4f2",
                padding: "40px 6%",
                display: "flex",
                flexDirection: "column",
                gap: "30px",
            }}
        >
            <button
                onClick={() => {
                    onBack();
                    setPendingVariantKeys([]);
                }}
                style={{
                    alignSelf: "flex-start",
                    border: "none",
                    background: "transparent",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    color: "#4a4a4a",
                }}
            >
                ← Torna indietro
            </button>

            <div>
                <p
                    style={{
                        letterSpacing: "0.35em",
                        fontSize: "0.75rem",
                        marginBottom: "8px",
                    }}
                >
                    COLLEZIONE
                </p>
                <h2 style={{ fontSize: "2rem", margin: "8px 0 24px 0" }}>
                    {SOFA_FAMILY_NAME}
                </h2>

                {/* Iterate through all categories */}
                {sofaCatalog.map((category, categoryIndex) => (
                    <div key={categoryIndex} style={{ marginBottom: "40px" }}>
                        <h3
                            style={{
                                fontSize: "1.2rem",
                                fontWeight: "600",
                                letterSpacing: "0.15em",
                                color: "#666",
                                marginBottom: "20px",
                                textTransform: "uppercase",
                            }}
                        >
                            {category.category}
                        </h3>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: "20px",
                            }}
                        >
                            {category.items.map((item) => {
                                const isSelected = pendingVariantKeys.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() =>
                                            setPendingVariantKeys((prev) => {
                                                if (prev.includes(item.id)) {
                                                    return prev.filter((id) => id !== item.id);
                                                }
                                                return [...prev, item.id];
                                            })
                                        }
                                        style={{
                                            background: "#fff",
                                            borderRadius: "20px",
                                            padding: "22px 24px",
                                            border: isSelected
                                                ? "2px solid #000"
                                                : "1px solid #e0e0e0",
                                            cursor: "pointer",
                                            boxShadow: isSelected
                                                ? "0 14px 28px rgba(0,0,0,0.12)"
                                                : "0 8px 16px rgba(0,0,0,0.06)",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "15rem",
                                                borderRadius: "14px",
                                                backgroundImage: `url(${getItemImagePath(item.id)})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundColor: "#f4f4f4",
                                                marginBottom: "16px",
                                            }}
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                                                {item.name}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    letterSpacing: "0.25em",
                                                    color: "#7a7a7a",
                                                }}
                                            >
                                                {item.fabricGroup}
                                            </span>
                                        </div>
                                        <p style={{ margin: "0 0 8px 0", color: "#4a4a4a" }}>
                                            {item.description}
                                        </p>
                                        <div style={{ fontSize: "0.85rem", color: "#1b1b1b" }}>
                                            {item.dimensionsMetric}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "#7a7a7a" }}>
                                            {item.dimensionsImperial}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <button
                    onClick={onConfirm}
                    disabled={pendingVariantKeys.length === 0}
                    style={{
                        padding: "14px 32px",
                        borderRadius: "999px",
                        border: "1px solid #1b1b1b",
                        background: pendingVariantKeys.length > 0 ? "#1b1b1b" : "#d2d2d2",
                        color: pendingVariantKeys.length > 0 ? "#fff" : "#707070",
                        cursor: pendingVariantKeys.length > 0 ? "pointer" : "not-allowed",
                        letterSpacing: "0.1em",
                    }}
                >
                    INSERISCI IN SCENA
                </button>
            </div>
        </div>
    );
}
