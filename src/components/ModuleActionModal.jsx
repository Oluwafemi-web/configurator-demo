export default function ModuleActionModal({
    selectedChair,
    onClose,
    onRotate,
    onDuplicate,
    onDelete,
    onAddModules,
    onChangeMaterialModule,
    onChangeMaterialComposition,
}) {
    if (!selectedChair) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "transparent",
                    zIndex: 99,
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                data-selection-menu
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    zIndex: 100,
                    minWidth: "500px",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "transparent",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#999",
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>

                {/* Title */}
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "400",
                        letterSpacing: "0.2em",
                        marginBottom: "32px",
                        color: "#333",
                    }}
                >
                    {selectedChair.sofa.name.toUpperCase()}
                </div>

                {/* Action Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "16px",
                    }}
                >
                    {/* Rotate */}
                    <ActionButton
                        icon="🔄"
                        label="RUOTA"
                        onClick={onRotate}
                    />

                    {/* Duplicate */}
                    <ActionButton
                        icon="📋"
                        label="DUPLICA"
                        onClick={onDuplicate}
                    />

                    {/* Delete */}
                    <ActionButton
                        icon="🗑️"
                        label="ELIMINA"
                        onClick={onDelete}
                        variant="danger"
                    />


                    {/* <ActionButton
                        icon="➕"
                        label={
                            <>
                                AGGIUNGI MODULI
                                <br />
                                ALLA COMPOSIZIONE
                            </>
                        }
                        onClick={onAddModules}
                    />

                    <ActionButton
                        icon="🎨"
                        label={
                            <>
                                CAMBIA FINITURA
                                <br />
                                DEL MODULO SELEZIONATO
                            </>
                        }
                        onClick={onChangeMaterialModule}
                    />

                    <ActionButton
                        icon="🖌️"
                        label={
                            <>
                                CAMBIA FINITURA
                                <br />
                                DELLA COMPOSIZIONE
                            </>
                        }
                        onClick={onChangeMaterialComposition}
                    /> */}
                </div>
            </div>
        </>
    );
}

function ActionButton({ icon, label, onClick, variant = "default" }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "24px 16px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
                if (variant === "danger") {
                    e.currentTarget.style.background = "#fff5f5";
                    e.currentTarget.style.borderColor = "#ff6b6b";
                } else {
                    e.currentTarget.style.background = "#f8f8f8";
                    e.currentTarget.style.borderColor = "#999";
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#ddd";
            }}
        >
            <div style={{ fontSize: "24px" }}>{icon}</div>
            <div
                style={{
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    color: "#666",
                    textAlign: "center",
                    lineHeight: "1.3",
                }}
            >
                {label}
            </div>
        </button>
    );
}
