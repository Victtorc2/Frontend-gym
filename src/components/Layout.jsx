import { useState } from "react";
import { C } from "../styles/colors";

export default function Layout({ nav, views, auth, logout }) {
  const [view, setView] = useState(nav[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentLabel = nav.find(n => n.id === view)?.label;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }

        .nav-btn {
          transition: background 0.18s, color 0.18s, transform 0.12s;
          position: relative;
          overflow: hidden;
        }
        .nav-btn:hover {
          background: rgba(255,214,0,0.10) !important;
          transform: translateX(2px);
        }
        .nav-btn:hover .nav-label { color: #1a1a1a !important; }
        .nav-btn:hover .nav-icon  { color: #FFD600 !important; }
        .nav-btn.active {
          background: linear-gradient(135deg, #FFD600 0%, #FFC000 100%) !important;
          box-shadow: 0 4px 12px rgba(255,214,0,0.35);
        }
        .nav-btn.active .nav-icon  { color: #111 !important; }
        .nav-btn.active .nav-label { color: #111 !important; font-weight: 700 !important; }
        .nav-btn.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: rgba(0,0,0,0.18);
          border-radius: 0 2px 2px 0;
        }

        .logout-btn:hover {
          background: #FFD600 !important;
          color: #111 !important;
          border-color: #FFD600 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,214,0,0.25);
        }
        .sidebar-toggle:hover {
          background: rgba(255,214,0,0.08) !important;
          border-color: #FFD600 !important;
          color: #FFD600 !important;
        }

        .row-card {
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.12s;
        }
        .row-card:hover {
          box-shadow: 0 6px 20px rgba(255,214,0,0.15);
          border-color: #FFD600;
          transform: translateY(-1px);
        }

        .tab-btn {
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .tab-btn:hover:not(.active) {
          border-color: #FFD600 !important;
          color: #FFD600 !important;
        }

        .ui-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(20,20,15,0.14);
          filter: brightness(1.05);
        }
        .ui-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }

        * { box-sizing: border-box; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: C.bgTert }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarOpen ? 240 : 64,
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
          borderRight: `1px solid ${C.border}`,
        }}>

          {/* Logo */}
          <div style={{
            padding: sidebarOpen ? "1.4rem 1.25rem" : "1.4rem 0",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${C.border}`,
            justifyContent: sidebarOpen ? "flex-start" : "center",
            background: C.bg,
          }}>
            <div style={{
              width: 38, height: 38,
              background: "linear-gradient(135deg, #FFD600 0%, #FF9900 100%)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(255,214,0,0.4)",
            }}>
              <i className="ti ti-barbell" style={{ color: "#111", fontSize: 20 }} />
            </div>
            {sidebarOpen && (
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 24,
                color: C.text,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}>
                GYM<span style={{ color: "#E6AC00" }}>WARRIOR</span>
              </span>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "1rem 0.6rem", display: "flex", flexDirection: "column", gap: 2 }}>
            {sidebarOpen && (
              <div style={{
                fontSize: 10,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                color: "#444",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "0 10px 8px",
              }}>
                MENÚ PRINCIPAL
              </div>
            )}

            {nav.map(n => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`nav-btn${view === n.id ? " active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: sidebarOpen ? "11px 14px" : "12px 0",
                  width: "100%",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 10,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: "transparent",
                }}
              >
                <i
                  className={`ti ti-${n.icon} nav-icon`}
                  style={{
                    fontSize: 19,
                    flexShrink: 0,
                    color: view === n.id ? "#111" : "#888",
                    transition: "color 0.18s",
                  }}
                />
                {sidebarOpen && (
                  <span
                    className="nav-label"
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: view === n.id ? 700 : 500,
                      fontSize: 14,
                      letterSpacing: "0.01em",
                      color: view === n.id ? "#111" : "#666",
                      transition: "color 0.18s",
                    }}
                  >
                    {n.label}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Toggle */}
          <div style={{ padding: "0.75rem 0.6rem", borderTop: `1px solid ${C.border}` }}>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", padding: "9px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                color: "#555",
                borderRadius: 8,
                transition: "all 0.18s",
              }}
            >
              <i className={`ti ti-chevron-${sidebarOpen ? "left" : "right"}`} style={{ fontSize: 16 }} />
            </button>
          </div>
        </aside>

        {/* ── Main (fondo blanco) ── */}
        <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <header style={{
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
            padding: "0 1.5rem",
            height: 62,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: "linear-gradient(135deg, #FFD600, #FF9900)",
                width: 4, height: 26,
                borderRadius: 2,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: C.text,
                letterSpacing: "0.05em",
              }}>
                {currentLabel?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 14px",
                background: C.bgSec,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FFD600, #FF9900)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="ti ti-user" style={{ fontSize: 13, color: "#111" }} />
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Barlow', sans-serif",
                  color: C.text,
                }}>{auth.nombre || "Usuario"}</span>
              </div>
              <button
                className="logout-btn"
                onClick={logout}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: C.text,
                  border: `1px solid ${C.borderSec}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Barlow', sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.18s",
                  letterSpacing: "0.02em",
                }}
              >
                <i className="ti ti-logout" /> Salir
              </button>
            </div>
          </header>

          {/* Content */}
          <div style={{ padding: "1.75rem", flex: 1, background: C.bgTert }}>
            {views[view]}
          </div>
        </main>
      </div>
    </>
  );
}
