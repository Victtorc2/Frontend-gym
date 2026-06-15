import { useState } from "react";
import { C } from "../styles/colors";
import api from "../services/api";

export default function LoginView({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      api.setToken(res.data.access_token);
      localStorage.setItem("gym_user", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.bgTert }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-input { transition: border-color 0.18s, box-shadow 0.18s; }
        .login-input:focus { border-color: #FFD600 !important; box-shadow: 0 0 0 3px rgba(255,214,0,0.15) !important; outline: none; }
        .login-submit { transition: all 0.18s; }
        .login-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,214,0,0.4) !important; }
        .login-submit:active { transform: translateY(0); }
      `}</style>

      {/* ── Panel izquierdo amarillo ── */}
      <div style={{
        width: "46%",
        background: "linear-gradient(160deg, #FFD600 0%, #FFC200 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 380, height: 380, borderRadius: "50%", background: "rgba(0,0,0,0.06)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(0,0,0,0.06)" }} />
        <div style={{ position: "absolute", top: "35%", right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(0,0,0,0.04)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 13, marginBottom: "3rem" }}>
            <div style={{
              width: 52, height: 52,
              background: "#111",
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            }}>
              <i className="ti ti-barbell" style={{ fontSize: 26, color: "#FFD600" }} />
            </div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 30,
              color: "#111", letterSpacing: "0.08em",
            }}>
              GYM<span style={{ opacity: 0.65 }}>WARRIOR</span>
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 56,
            color: "#111", lineHeight: 1.0,
            marginBottom: "1.25rem", letterSpacing: "0.01em",
          }}>
            GESTIÓN<br />
            <span style={{ opacity: 0.65, fontSize: 46 }}>INTELIGENTE</span><br />
            DE GIMNASIO
          </h1>
          <p style={{
            fontSize: 15, color: "rgba(0,0,0,0.6)",
            lineHeight: 1.7, maxWidth: 300,
            fontFamily: "'Barlow', sans-serif",
          }}>
            Controla membresías, asistencias y reportes desde un solo lugar.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: "2.5rem" }}>
            {[
              { icon: "users", label: "Clientes" },
              { icon: "id-badge", label: "Membresías" },
              { icon: "chart-bar", label: "Reportes" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                padding: "12px 16px",
                background: "rgba(0,0,0,0.1)",
                borderRadius: 12, minWidth: 80,
              }}>
                <i className={`ti ti-${item.icon}`} style={{ fontSize: 22, color: "#111" }} />
                <span style={{
                  fontSize: 11, fontWeight: 800, color: "#111",
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em",
                }}>{item.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho oscuro ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: C.bg,
      }}>
        <div style={{ width: "100%", maxWidth: 390 }}>

          {/* Mini brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2.5rem" }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg,#FFD600,#FF9900)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-barbell" style={{ fontSize: 15, color: "#111" }} />
            </div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800, fontSize: 18,
              color: C.text, letterSpacing: "0.08em",
            }}>
              GYM<span style={{ color: "#E6AC00" }}>WARRIOR</span>
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800, fontSize: 32,
            color: C.text, marginBottom: 6, letterSpacing: "0.03em",
          }}>INICIAR SESIÓN</h2>
          <p style={{
            color: C.textSec, fontSize: 14,
            marginBottom: "2.25rem",
            fontFamily: "'Barlow', sans-serif",
          }}>
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 11, color: C.textSec, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>Correo electrónico</label>
              <input
                className="login-input"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.borderSec}`,
                  background: C.bgSec,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 11, color: C.textSec, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>Contraseña</label>
              <input
                className="login-input"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.borderSec}`,
                  background: C.bgSec,
                  color: C.text,
                  fontSize: 14,
                  fontFamily: "'Barlow', sans-serif",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.10)",
                color: "#dc2626",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "'Barlow', sans-serif",
              }}>
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
              style={{
                padding: "13px",
                background: "linear-gradient(135deg, #FFD600 0%, #FFC200 100%)",
                color: "#111",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
                boxShadow: "0 4px 14px rgba(255,214,0,0.3)",
              }}
            >
              {loading && <div style={{
                width: 16, height: 16,
                border: "2px solid #111",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />}
              INICIAR SESIÓN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
