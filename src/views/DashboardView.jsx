import { useState, useEffect } from "react";
import { C } from "../styles/colors";
import { Spinner } from "../components";
import api from "../services/api";

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/clientes?per_page=1"),
      api.get("/api/membresias?estado=activa"),
      api.get("/api/asistencias?per_page=1"),
      api.get("/api/reportes/clientes/activos"),
    ]).then(([clients, mems, att, report]) => {
      setStats({
        totalClientes: clients.value?.data?.total ?? "—",
        membresíasActivas: Array.isArray(mems.value?.data) ? mems.value.data.length : "—",
        asistenciaHoy: att.value?.data?.total ?? "—",
        clientesActivos: report.value?.data?.total_activos ?? "—",
      });
      setLoading(false);
    });
  }, []);

  const metrics = [
    { icon: "users",      label: "Clientes totales",   value: stats?.totalClientes,       accent: "#FFD600" },
    { icon: "id-badge",   label: "Membresías activas", value: stats?.membresíasActivas,   accent: "#111" },
    { icon: "activity",   label: "Total asistencias",  value: stats?.asistenciaHoy,       accent: "#FFD600" },
    { icon: "user-check", label: "Clientes activos",   value: stats?.clientesActivos,     accent: "#111" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 style={{
          fontSize: 32,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          color: C.black,
        }}>PANEL PRINCIPAL</h2>
        <span style={{ fontSize: 14, color: C.textSec }}>Resumen general del sistema</span>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {metrics.map((m, i) => (
            <div key={m.label} style={{
              background: i % 2 === 0 ? "#FFD600" : C.black,
              borderRadius: 16,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Background icon watermark */}
              <div style={{
                position: "absolute", right: -8, bottom: -8,
                opacity: 0.1,
              }}>
                <i className={`ti ti-${m.icon}`} style={{ fontSize: 80, color: i % 2 === 0 ? "#000" : "#fff" }} />
              </div>

              <div style={{
                width: 36, height: 36,
                background: i % 2 === 0 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`ti ti-${m.icon}`} style={{
                  fontSize: 18,
                  color: i % 2 === 0 ? "#111" : "#FFD600",
                }} />
              </div>

              <div>
                <div style={{
                  fontSize: 44,
                  fontWeight: 800,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: i % 2 === 0 ? "#111" : "#fff",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {m.value ?? "—"}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: i % 2 === 0 ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: "2rem",
        padding: "1.25rem",
        background: C.bg,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        borderLeft: "4px solid #FFD600",
      }}>
        <p style={{ color: C.textSec, fontSize: 14, lineHeight: 1.6 }}>
          <i className="ti ti-info-circle" style={{ marginRight: 8, color: "#FFD600" }} />
          Usa el menú lateral para navegar a Clientes, Membresías, Asistencias, Clientes Diarios y Reportes.
        </p>
      </div>
    </div>
  );
}
