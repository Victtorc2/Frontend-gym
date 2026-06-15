import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState } from "../../components";
import api from "../../services/api";

const afluenciaBadge = { BAJA: "success", MEDIA: "warning", ALTA: "danger" };
const statLabel = { fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em" };

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

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Horario Recomendado</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec, textTransform: "capitalize" }}>Hoy es {data.dia_actual}</p>
      </div>

      <div style={{
        padding: "1.25rem", background: C.bg, borderRadius: 12,
        border: `1px solid ${C.border}`, borderLeft: "4px solid #FFD600", marginBottom: 20,
      }}>
        <p style={{ margin: 0, color: C.text, fontSize: 14, lineHeight: 1.6 }}>
          <i className="ti ti-bulb" style={{ marginRight: 8, color: "#FFD600" }} />
          {data.mensaje}
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {data.horario_recomendado && (
          <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #4caf50" }}>
            <div style={statLabel}>Mejor horario para ir</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{data.horario_recomendado.horario}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              ~{data.horario_recomendado.promedio_personas} personas
              <Badge type={afluenciaBadge[data.horario_recomendado.nivel_afluencia] || "neutral"}>{data.horario_recomendado.nivel_afluencia}</Badge>
            </div>
          </Card>
        )}
        {data.horario_a_evitar && (
          <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #e53935" }}>
            <div style={statLabel}>Horario a evitar</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{data.horario_a_evitar.horario}</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              ~{data.horario_a_evitar.promedio_personas} personas
              <Badge type={afluenciaBadge[data.horario_a_evitar.nivel_afluencia] || "neutral"}>{data.horario_a_evitar.nivel_afluencia}</Badge>
            </div>
          </Card>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Horarios libres hoy</h3>
          {data.horarios_libres_hoy.length === 0 ? <EmptyState icon="clock" text="No hay horarios libres registrados para hoy" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.horarios_libres_hoy.map((b, i) => (
                <Card key={i} style={{ padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{b.horario}</span>
                  <Badge type="success">{b.promedio_personas}</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Horas pico hoy</h3>
          {data.horas_pico_hoy.length === 0 ? <EmptyState icon="clock" text="No hay horas pico registradas para hoy" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.horas_pico_hoy.map((b, i) => (
                <Card key={i} style={{ padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{b.horario}</span>
                  <Badge type="danger">{b.promedio_personas}</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
