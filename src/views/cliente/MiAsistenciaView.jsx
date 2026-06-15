import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState } from "../../components";
import api from "../../services/api";

const statLabel = { fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em" };
const statValue = { fontSize: 28, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", marginTop: 4 };

export default function MiAsistenciaView() {
  const [asistencia, setAsistencia] = useState(null);
  const [frecuencia, setFrecuencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/cliente/mi-asistencia"),
      api.get("/api/cliente/mi-asistencia/frecuencia"),
    ]).then(([a, f]) => {
      if (a.status === "fulfilled") setAsistencia(a.value.data);
      else setError(a.reason.message);
      if (f.status === "fulfilled") setFrecuencia(f.value.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="activity" text={error} />;
  if (!asistencia) return null;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mi Asistencia</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={statLabel}>Total asistencias</div>
          <div style={statValue}>{asistencia.total_asistencias}</div>
        </Card>
        <Card>
          <div style={statLabel}>Aprobadas</div>
          <div style={{ ...statValue, color: "#2e7d32" }}>{asistencia.total_aprobados}</div>
        </Card>
        <Card>
          <div style={statLabel}>Denegadas</div>
          <div style={{ ...statValue, color: "#c62828" }}>{asistencia.total_denegados}</div>
        </Card>
        {frecuencia && (
          <Card>
            <div style={statLabel}>Frecuencia semanal</div>
            <div style={statValue}>{frecuencia.frecuencia_semanal}</div>
          </Card>
        )}
      </div>

      {frecuencia && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13 }}>
            <span>Ingresos este mes: <b>{frecuencia.asistencias_mes_actual}</b></span>
            <span>Primer ingreso: <b>{frecuencia.primer_ingreso || "—"}</b></span>
            <span>Último ingreso: <b>{frecuencia.ultimo_ingreso || "—"}</b></span>
          </div>
        </Card>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Historial</h3>
      {asistencia.historial.length === 0 ? <EmptyState icon="activity" text="Aún no tienes registros de asistencia" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {asistencia.historial.map(h => (
            <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "0.75rem 1rem" }}>
              <span style={{ fontSize: 13 }}>{h.fecha} · {h.hora}</span>
              <Badge type={h.estado === "ingreso_aprobado" ? "success" : "danger"}>
                {h.estado === "ingreso_aprobado" ? "Aprobado" : "Denegado"}
              </Badge>
              {h.motivo_denegacion && <span style={{ fontSize: 12, color: C.textSec }}>{h.motivo_denegacion}</span>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
