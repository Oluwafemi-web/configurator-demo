/**
 * LandingScreen Component
 * Displays the initial landing page with hero section and launch button
 */
export default function LandingScreen({ onLaunch }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#e8e6e1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "60px 8%",
                gap: "60px",
                flexWrap: "wrap",
            }}
        >
            <div style={{ flex: "1 1 400px" }}>
                <p
                    style={{
                        letterSpacing: "0.15em",
                        fontSize: "0.75rem",
                        fontWeight: "400",
                        marginBottom: "30px",
                        color: "#3a3a3a",
                    }}
                >
                    Configurator
                </p>
                <h1
                    style={{
                        fontSize: "3.5rem",
                        margin: "0 0 20px 0",
                        fontWeight: "300",
                        letterSpacing: "0.2em",
                        lineHeight: "1.1",
                    }}
                >
                    JUMP SOFA
                </h1>
                <p
                    style={{
                        maxWidth: "420px",
                        color: "#6a6a6a",
                        lineHeight: 1.6,
                        fontSize: "0.95rem",
                        marginBottom: "8px",
                    }}
                >
                    Scopri tutte le configurazioni, cambia forme
                </p>
                <p
                    style={{
                        maxWidth: "420px",
                        color: "#6a6a6a",
                        lineHeight: 1.6,
                        fontSize: "0.95rem",
                        marginBottom: "0",
                    }}
                >
                    e materiali.
                </p>
                <p
                    style={{
                        maxWidth: "420px",
                        color: "#9a9a9a",
                        lineHeight: 1.6,
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                        marginTop: "15px",
                    }}
                >
                    Clicca e produci in ogni settore.
                </p>
                <button
                    onClick={onLaunch}
                    style={{
                        marginTop: "40px",
                        padding: "12px 24px",
                        borderRadius: "0",
                        border: "1px solid #2a2a2a",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        letterSpacing: "0.1em",
                        fontWeight: "400",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#2a2a2a";
                        e.target.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#000";
                    }}
                >
                    CONFIGURA SISTEMA MODULARE
                </button>
            </div>
            <div
                style={{
                    flex: "1 1 500px",
                    minHeight: "400px",
                    backgroundImage: "url('/sofa-hero.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "0",
                    boxShadow: "none",
                }}
            />
        </div>
    );
}
