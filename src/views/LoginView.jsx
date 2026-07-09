import { useState } from "react";
import { C } from "../styles/colors";
import api from "../services/api";
import loginImg from "../assets/login-gym.jpg";

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
    <div className="login-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        .login-wrap { min-height: 100vh; display: flex; font-family: 'Barlow', sans-serif; }
        .login-hero {
          flex: 1.05; position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .login-hero img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center 72%;
          filter: grayscale(18%) contrast(1.03);
        }
        .login-hero .veil {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.35) 55%, rgba(10,10,10,0.9) 100%);
        }
        .login-form-side {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2.5rem; background: var(--login-bg);
        }
        .login-field {
          width: 100%; padding: 13px 15px; border-radius: 12px; font-size: 14.5px;
          border: 1.5px solid var(--login-border); background: var(--login-input-bg);
          color: var(--login-text); outline: none; font-family: 'Barlow', sans-serif;
          transition: border-color .18s, box-shadow .18s;
        }
        .login-field:focus { border-color: #FFD600; box-shadow: 0 0 0 4px rgba(255,214,0,0.14); }
        .login-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px; cursor: pointer;
          background: #111; color: #fff; font-size: 15px; font-weight: 700;
          letter-spacing: .04em; display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform .16s, box-shadow .16s, background .16s; font-family: 'Barlow', sans-serif;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.28); }
        .login-btn:disabled { opacity: .65; cursor: not-allowed; }

        @media (max-width: 860px) { .login-hero { display: none; } }
      `}</style>

      {/* ── Imagen de bienvenida ── */}
      <div className="login-hero">
        <img src={loginImg} alt="Entrenamiento en el gimnasio" />
        <div className="veil" />
        <div style={{ position: "relative", zIndex: 1, padding: "3rem 3.2rem 3.4rem", animation: "fadeUp .6s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#FFD600,#FF9900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-barbell" style={{ fontSize: 21, color: "#111" }} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "0.1em" }}>
              GYM<span style={{ color: "#FFD600" }}>WARRIOR</span>
            </span>
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 46, lineHeight: 1.05, color: "#fff", letterSpacing: "0.01em" }}>
            Cada repetición<br />te acerca a tu meta.
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 15, color: "rgba(255,255,255,0.72)", maxWidth: 360, lineHeight: 1.6 }}>
            Bienvenido a tu espacio de entrenamiento. Gestiona todo desde un solo lugar.
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="login-form-side" style={{
        // Variables de tema para adaptarse a claro/oscuro
        "--login-bg": C.bg,
        "--login-input-bg": C.bgSec,
        "--login-border": C.borderSec,
        "--login-text": C.text,
      }}>
        <div style={{ width: "100%", maxWidth: 380, animation: "fadeUp .5s ease both" }}>
          {/* Marca compacta (visible sobre todo en móvil) */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 34 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#FFD600,#FF9900)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-barbell" style={{ fontSize: 16, color: "#111" }} />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: C.text, letterSpacing: "0.08em" }}>
              GYM<span style={{ color: "#E6AC00" }}>WARRIOR</span>
            </span>
          </div>

          <h2 style={{ margin: "0 0 6px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 34, color: C.text, letterSpacing: "0.01em" }}>
            Bienvenido 👋
          </h2>
          <p style={{ margin: "0 0 30px", color: C.textSec, fontSize: 14.5, lineHeight: 1.6 }}>
            Inicia sesión para continuar en el sistema.
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 12.5, color: C.textSec, fontWeight: 600 }}>Correo electrónico</label>
              <input className="login-field" type="email" placeholder="tucorreo@gym.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoFocus />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 12.5, color: C.textSec, fontWeight: 600 }}>Contraseña</label>
              <input className="login-field" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.10)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)", padding: "11px 14px", borderRadius: 10, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: 6 }}>
              {loading && <span style={{ width: 15, height: 15, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />}
              {loading ? "Ingresando..." : "Iniciar sesión"}
              {!loading && <i className="ti ti-arrow-right" style={{ fontSize: 16 }} />}
            </button>
          </form>

          <p style={{ margin: "26px 0 0", fontSize: 12.5, color: C.textSec, textAlign: "center" }}>
            GYMWARRIOR · Gestión inteligente de gimnasio
          </p>
        </div>
      </div>
    </div>
  );
}
