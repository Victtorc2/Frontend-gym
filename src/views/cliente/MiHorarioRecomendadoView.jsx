import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Badge, Card, Spinner, EmptyState, PageHeader } from "../../components";
import { heatColor } from "../../styles/colors";
import api from "../../services/api";

const afluenciaBadge = { BAJA: "success", MEDIA: "warning", ALTA: "danger" };

const statLabel = {
  fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em",
  fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", display: "flex", alignItems: "center",
};

const sectionTitle = {
  fontSize: 14, fontWeight: 700, marginBottom: 8,
  fontFamily: "'Barlow Condensed', sans-serif",
  textTransform: "uppercase", letterSpacing: "0.04em",
  display: "flex", alignItems: "center",
};

export default function MiHorarioRecomendadoView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/cliente/mi-horario-recomendado")
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="clock" text={error} />;
  if (!data) return null;

  const diaActual = data.dia_actual ? data.dia_actual.charAt(0).toUpperCase() + data.dia_actual.slice(1) : "";

  return (
    <div>
      <PageHeader icon="clock" title="Horario recomendado" subtitle={`Hoy es ${diaActual}`} />

      <div style={{
        padding: "1.25rem", background: "#FFF8E1", borderRadius: 12,
        border: `1px solid ${C.border}`, borderLeft: "4px solid #FFD600", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "#FFD600",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="ti ti-bulb" style={{ fontSize: 20, color: "#111" }} />
        </div>
        <p style={{ margin: 0, color: C.text, fontSize: 14, lineHeight: 1.6 }}>{data.mensaje}</p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {data.horario_recomendado && (
          <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #4caf50", background: "#e8f5e9" }}>
            <div style={statLabel}><i className="ti ti-thumb-up" style={{ marginRight: 6, color: "#2e7d32" }} />Mejor horario para ir</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>{data.horario_recomendado.horario}</div>
            <div style={{ fontSize: 12, color: "#2e7d32", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              ~{data.horario_recomendado.promedio_personas} personas
              <Badge type={afluenciaBadge[data.horario_recomendado.nivel_afluencia] || "neutral"}>{data.horario_recomendado.nivel_afluencia}</Badge>
            </div>
          </Card>
        )}
        {data.horario_a_evitar && (
          <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #e53935", background: "#ffebee" }}>
            <div style={statLabel}><i className="ti ti-alert-triangle" style={{ marginRight: 6, color: "#c62828" }} />Horario a evitar</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>{data.horario_a_evitar.horario}</div>
            <div style={{ fontSize: 12, color: "#c62828", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              ~{data.horario_a_evitar.promedio_personas} personas
              <Badge type={afluenciaBadge[data.horario_a_evitar.nivel_afluencia] || "neutral"}>{data.horario_a_evitar.nivel_afluencia}</Badge>
            </div>
          </Card>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3 style={sectionTitle}><i className="ti ti-circle-check" style={{ marginRight: 6, color: "#4caf50" }} />Horarios libres hoy</h3>
          {data.horarios_libres_hoy.length === 0 ? <EmptyState icon="clock" text="No hay horarios libres registrados para hoy" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.horarios_libres_hoy.map((b, i) => {
                const hc = heatColor("BAJA");
                return (
                  <Card key={i} style={{ padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: hc.bg, borderLeft: `4px solid ${hc.border}`, border: "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>{b.horario}</span>
                    <Badge type="success">{b.promedio_personas} personas</Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h3 style={sectionTitle}><i className="ti ti-flame" style={{ marginRight: 6, color: "#e53935" }} />Horas pico hoy</h3>
          {data.horas_pico_hoy.length === 0 ? <EmptyState icon="clock" text="No hay horas pico registradas para hoy" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.horas_pico_hoy.map((b, i) => {
                const hc = heatColor("ALTA");
                return (
                  <Card key={i} style={{ padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: hc.bg, borderLeft: `4px solid ${hc.border}`, border: "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>{b.horario}</span>
                    <Badge type="danger">{b.promedio_personas} personas</Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
