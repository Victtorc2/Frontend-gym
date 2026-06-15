import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Alert, Spinner, EmptyState, PageHeader, StatCard, Row } from "../components";
import { heatColor } from "../styles/colors";
import api from "../services/api";

const DIAS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
];

const afluenciaBadge = { BAJA: "success", MEDIA: "warning", ALTA: "danger" };

const statLabel = { fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em" };

const hora = (t) => (typeof t === "string" ? t.slice(0, 5) : t);

export default function RecomendacionesView() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState("");
  const [genError, setGenError] = useState("");

  const [dia, setDia] = useState("lunes");
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState("");

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/api/recomendaciones/estadisticas");
      setStats(res.data);
    } catch {
      setStats(null);
    }
    setLoadingStats(false);
  }, []);

  const loadSchedule = useCallback(async (d) => {
    setLoadingSchedule(true);
    setScheduleError("");
    try {
      const res = await api.get(`/api/recomendaciones/dia/${d}`);
      setSchedule(res.data);
    } catch (err) {
      setSchedule(null);
      setScheduleError(err.message);
    }
    setLoadingSchedule(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadSchedule(dia); }, [dia, loadSchedule]);

  const generar = async () => {
    setGenerating(true); setGenMessage(""); setGenError("");
    try {
      const res = await api.post("/api/recomendaciones/generar");
      setGenMessage(res.data.mensaje);
      loadStats();
      loadSchedule(dia);
    } catch (err) {
      setGenError(err.message);
    }
    setGenerating(false);
  };

  return (
    <div>
      <PageHeader
        icon="clock"
        title="Horarios recomendados"
        subtitle="Análisis de afluencia para optimizar la asistencia"
        actions={
          <Btn variant="primary" onClick={generar} loading={generating}>
            <i className="ti ti-refresh" /> Generar análisis
          </Btn>
        }
      />

      {genMessage && <Alert type="success">{genMessage}</Alert>}
      {genError && <Alert>{genError}</Alert>}

      {loadingStats ? <Spinner /> : !stats ? (
        <EmptyState icon="clock" text="Aún no se han generado recomendaciones. Usa 'Generar análisis'." />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            <StatCard icon="calendar-stats" label="Total semanal" value={stats.total_semanal} color="#FFD600" />
            <StatCard icon="chart-bar" label="Promedio por día" value={stats.promedio_por_dia} color="#42a5f5" />
            <StatCard icon="hourglass" label="Promedio por hora" value={stats.promedio_por_hora} color="#66bb6a" />
            <StatCard icon="gauge" label="Ocupación" value={`${stats.porcentaje_ocupacion}%`} color="#ab47bc" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <Card style={{ borderLeft: "4px solid #e53935" }}>
              <div style={statLabel}><i className="ti ti-flame" style={{ marginRight: 6, color: "#e53935" }} />Horario más concurrido</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, textTransform: "capitalize", fontFamily: "'Barlow Condensed', sans-serif" }}>{stats.horario_mas_concurrido || "—"}</div>
            </Card>
            <Card style={{ borderLeft: "4px solid #4caf50" }}>
              <div style={statLabel}><i className="ti ti-leaf" style={{ marginRight: 6, color: "#4caf50" }} />Horario menos concurrido</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, textTransform: "capitalize", fontFamily: "'Barlow Condensed', sans-serif" }}>{stats.horario_menos_concurrido || "—"}</div>
            </Card>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Resumen por día</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            {stats.por_dia.map(d => (
              <Row key={d.dia_semana} style={{ padding: "0.75rem 1rem" }}>
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize", fontFamily: "'Barlow Condensed', sans-serif" }}>{d.dia_semana}</span>
                <span style={{ fontSize: 12, color: C.textSec }}>Promedio/hora: {d.promedio_por_hora}</span>
                <span style={{ fontSize: 12, color: C.textSec }}>Total: {d.total_ingresos}</span>
                <Badge type="danger">Pico: {d.hora_pico}</Badge>
                <Badge type="success">Libre: {d.hora_libre}</Badge>
              </Row>
            ))}
          </div>
        </>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>Detalle por día</h3>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {DIAS.map(d => (
          <Btn
            key={d.id}
            variant={dia === d.id ? "primary" : "default"}
            className={dia === d.id ? "tab-btn active" : "tab-btn"}
            onClick={() => setDia(d.id)}
          >
            {d.label}
          </Btn>
        ))}
      </div>

      {loadingSchedule ? <Spinner /> : scheduleError ? (
        <EmptyState icon="calendar-off" text={scheduleError} />
      ) : schedule && (
        <div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
            {schedule.horario_recomendado && (
              <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #4caf50", background: "#e8f5e9" }}>
                <div style={statLabel}><i className="ti ti-thumb-up" style={{ marginRight: 6, color: "#2e7d32" }} />Horario recomendado</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {hora(schedule.horario_recomendado.hora_inicio)} - {hora(schedule.horario_recomendado.hora_fin)}
                </div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
                  Promedio: {schedule.horario_recomendado.cantidad_promedio} personas
                </div>
              </Card>
            )}
            {schedule.horario_pico && (
              <Card style={{ flex: 1, minWidth: 220, borderLeft: "4px solid #e53935", background: "#ffebee" }}>
                <div style={statLabel}><i className="ti ti-alert-triangle" style={{ marginRight: 6, color: "#c62828" }} />Hora pico (evitar)</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {hora(schedule.horario_pico.hora_inicio)} - {hora(schedule.horario_pico.hora_fin)}
                </div>
                <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
                  Promedio: {schedule.horario_pico.cantidad_promedio} personas
                </div>
              </Card>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {schedule.bloques.map(b => {
              const hc = heatColor(b.nivel_afluencia);
              return (
                <Card key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "0.75rem 1rem", background: hc.bg, borderLeft: `4px solid ${hc.border}`, border: "none" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif" }}>{hora(b.hora_inicio)} - {hora(b.hora_fin)}</span>
                  <span style={{ fontSize: 12, color: hc.text }}>{b.cantidad_promedio} personas en promedio</span>
                  <Badge type={afluenciaBadge[b.nivel_afluencia] || "neutral"}>{b.nivel_afluencia}</Badge>
                  {b.es_recomendado && <Badge type="success">Recomendado</Badge>}
                  {b.evitar && <Badge type="danger">Evitar</Badge>}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
