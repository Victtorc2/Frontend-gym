import { useState, useEffect } from "react";
import { C, heatColor } from "../../styles/colors";
import { Row, Badge, Spinner, EmptyState, PageHeader, StatCard, Avatar } from "../../components";
import api from "../../services/api";

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
      <PageHeader icon="activity" title="Mi asistencia" subtitle="Tu historial de ingresos al gimnasio" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
        <StatCard icon="activity" label="Total asistencias" value={asistencia.total_asistencias} color="#FFD600" />
        <StatCard icon="circle-check" label="Aprobadas" value={asistencia.total_aprobados} color="#66bb6a" />
        <StatCard icon="circle-x" label="Denegadas" value={asistencia.total_denegados} color="#ef5350" />
        {frecuencia && <StatCard icon="calendar-stats" label="Frecuencia semanal" value={frecuencia.frecuencia_semanal} color="#42a5f5" />}
      </div>

      {frecuencia && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, marginBottom: 20, color: C.textSec }}>
          <span>Ingresos este mes: <b style={{ color: C.text }}>{frecuencia.asistencias_mes_actual}</b></span>
          <span>Primer ingreso: <b style={{ color: C.text }}>{frecuencia.primer_ingreso || "—"}</b></span>
          <span>Último ingreso: <b style={{ color: C.text }}>{frecuencia.ultimo_ingreso || "—"}</b></span>
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Historial
      </h3>
      {asistencia.historial.length === 0 ? <EmptyState icon="activity" text="Aún no tienes registros de asistencia" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {asistencia.historial.map(h => {
            const aprobado = h.estado === "ingreso_aprobado";
            return (
              <Row key={h.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar color={aprobado ? heatColor("BAJA").bg : heatColor("ALTA").bg}>
                    <i className={`ti ti-${aprobado ? "circle-check" : "circle-x"}`} style={{ fontSize: 18, color: aprobado ? "var(--color-text-success)" : "var(--color-text-danger)" }} />
                  </Avatar>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{h.fecha} · {h.hora}</span>
                    {h.motivo_denegacion && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSec }}>{h.motivo_denegacion}</p>}
                  </div>
                </div>
                <Badge type={aprobado ? "success" : "danger"}>{aprobado ? "Aprobado" : "Denegado"}</Badge>
              </Row>
            );
          })}
        </div>
      )}
    </div>
  );
}
