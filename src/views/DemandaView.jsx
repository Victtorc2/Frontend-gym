import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Spinner, EmptyState, Alert, PageHeader, StatCard } from "../components";
import api from "../services/api";

const NIVEL_BADGE = { bajo: "success", medio: "warning", alto: "warning", muy_alto: "danger" };
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

const TABS = [
  { id: "hoy", label: "Demanda de hoy", icon: "chart-histogram" },
  { id: "entrenador", label: "Vista entrenador", icon: "clipboard-check" },
  { id: "indice", label: "Índice de demanda", icon: "trending-up" },
  { id: "precision", label: "Precisión", icon: "target-arrow" },
];

export default function DemandaView() {
  const [tab, setTab] = useState("hoy");
  return (
    <div>
      <PageHeader icon="chart-histogram" title="Gestión de demanda" subtitle="Analítica predictiva de uso de máquinas" />
      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <Btn key={t.id} variant={tab === t.id ? "primary" : "default"} className={tab === t.id ? "tab-btn active" : "tab-btn"} onClick={() => setTab(t.id)}>
            <i className={`ti ti-${t.icon}`} /> {t.label}
          </Btn>
        ))}
      </div>
      {tab === "hoy" && <TabHoy />}
      {tab === "entrenador" && <TabEntrenador />}
      {tab === "indice" && <TabIndice />}
      {tab === "precision" && <TabPrecision />}
    </div>
  );
}

const dateInput = { padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 13 };

function TabHoy() {
  const [fecha, setFecha] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setData((await api.get(`/api/demanda/hoy?fecha=${fecha}`)).data); } catch { setData(null); }
    setLoading(false);
  }, [fecha]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: C.textSec }}>Fecha:</span>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={dateInput} />
      </div>
      {loading ? <Spinner /> : !data ? <EmptyState icon="chart-histogram" text="Sin datos" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ borderLeft: "4px solid #FFD600" }}>
            <p style={{ margin: 0, fontWeight: 700 }}><i className="ti ti-calendar-event" /> {data.mensaje}</p>
            {data.maquinas_saturadas.length > 0 && (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#b91c1c" }}>
                <i className="ti ti-alert-triangle" /> Saturadas: {data.maquinas_saturadas.join(", ")}
              </p>
            )}
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            <Card>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'Barlow Condensed', sans-serif" }}>Demanda por máquina</h3>
              {data.demanda_por_maquina.length === 0 ? <p style={{ color: C.textSec, fontSize: 13 }}>Sin planificaciones.</p> :
                data.demanda_por_maquina.map(m => (
                  <div key={m.maquina_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{m.nombre}</span>
                      <span style={{ fontSize: 11, color: C.textSec, marginLeft: 6 }}>{m.zona} · {m.cantidad}u</span>
                    </div>
                    <div style={{ width: 110, height: 8, background: C.bgSec, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, m.clientes * 8)}%`, height: "100%", background: m.saturada ? "#ef4444" : "#FFD600" }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 26, textAlign: "right" }}>{m.clientes}</span>
                    {m.saturada && <Badge type="danger">saturada</Badge>}
                  </div>
                ))}
            </Card>

            <Card>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'Barlow Condensed', sans-serif" }}>Por horario</h3>
              {data.demanda_por_hora.length === 0 ? <p style={{ color: C.textSec, fontSize: 13 }}>—</p> :
                data.demanda_por_hora.map(h => (
                  <div key={h.horario} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13 }}>{h.horario}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: C.textSec }}>{h.clientes}</span>
                      <Badge type={NIVEL_BADGE[h.nivel]}>{h.nivel.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
            </Card>
          </div>

          <Card>
            <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'Barlow Condensed', sans-serif" }}>Distribución por zonas</h3>
            {data.distribucion_zonas.length === 0 ? <p style={{ color: C.textSec, fontSize: 13 }}>—</p> :
              data.distribucion_zonas.map(z => (
                <div key={z.zona} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                  <span style={{ width: 90, fontSize: 13, textTransform: "capitalize" }}>{z.zona}</span>
                  <div style={{ flex: 1, height: 10, background: C.bgSec, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${z.porcentaje}%`, height: "100%", background: "linear-gradient(90deg,#FFD600,#FF9900)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, width: 96, textAlign: "right" }}>{z.porcentaje}% ({z.clientes})</span>
                </div>
              ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function TabEntrenador() {
  const [fecha, setFecha] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setData((await api.get(`/api/demanda/entrenador?fecha=${fecha}`)).data); } catch { setData(null); }
    setLoading(false);
  }, [fecha]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: C.textSec }}>Fecha:</span>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={dateInput} />
      </div>
      {loading ? <Spinner /> : !data ? <EmptyState icon="clipboard-check" text="Sin datos" /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
            <StatCard icon="clipboard-check" label="Planificaron" value={data.total_planifico} color="#66bb6a" />
            <StatCard icon="clock-x" label="Sin confirmar" value={data.total_sin_confirmar} color="#ef4444" />
            <StatCard icon="users" label="Clientes activos" value={data.total_clientes} color="#42a5f5" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}><i className="ti ti-check" style={{ color: "#4caf50" }} /> Entrenan hoy</h3>
              {data.con_plan.length === 0 ? <p style={{ color: C.textSec, fontSize: 13 }}>Nadie ha planificado.</p> :
                data.con_plan.map(c => (
                  <div key={c.cliente_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre}</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                      {c.zonas.map(z => <Badge key={z} type="info">{z}</Badge>)}
                      <Badge type="neutral">{c.estado}</Badge>
                    </div>
                  </div>
                ))}
            </Card>
            <Card>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}><i className="ti ti-x" style={{ color: "#e53935" }} /> No confirmaron</h3>
              {data.sin_plan.length === 0 ? <p style={{ color: C.textSec, fontSize: 13 }}>Todos planificaron 🎉</p> :
                data.sin_plan.map(c => <div key={c.cliente_id} style={{ padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>{c.nombre}</div>)}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function TabIndice() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => { try { setData((await api.get("/api/demanda/indice")).data); } catch { setData(null); } setLoading(false); })();
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState icon="trending-up" text="Sin datos" />;

  return (
    <div>
      {data.recomendaciones.length > 0 && (
        <Card style={{ borderLeft: "4px solid #FFD600", marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 700 }}><i className="ti ti-bulb" /> Recomendaciones de inversión</p>
          {data.recomendaciones.map((r, i) => <p key={i} style={{ margin: "2px 0", fontSize: 13, color: C.textSec }}>• {r}</p>)}
        </Card>
      )}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.9fr 0.9fr 0.8fr 1fr", padding: "10px 14px", background: C.bgSec, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.textSec, letterSpacing: "0.04em" }}>
          <span>Máquina</span><span>Unid.</span><span>Planif.</span><span>Uso real</span><span>Índice</span><span>Estado</span>
        </div>
        {data.items.map(m => (
          <div key={m.maquina_id} style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.9fr 0.9fr 0.8fr 1fr", padding: "9px 14px", borderTop: `1px solid ${C.border}`, alignItems: "center", fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>{m.nombre}<span style={{ color: C.textSec, fontSize: 11, marginLeft: 5 }}>{m.zona}</span></span>
            <span>{m.cantidad}</span>
            <span>{m.planificaciones}</span>
            <span>{m.usos_reales_proxy}</span>
            <span style={{ fontWeight: 800, color: m.recomienda_invertir ? "#b91c1c" : C.text }}>{m.indice_demanda}</span>
            <span>{m.recomienda_invertir ? <Badge type="danger">invertir</Badge> : <Badge type="success">ok</Badge>}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function TabPrecision() {
  const [desde, setDesde] = useState(daysAgo(30));
  const [hasta, setHasta] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setData((await api.get(`/api/demanda/precision?desde=${desde}&hasta=${hasta}`)).data); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, color: C.textSec }}>Desde<br /><input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={dateInput} /></label>
        <label style={{ fontSize: 12, color: C.textSec }}>Hasta<br /><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={dateInput} /></label>
        <Btn variant="primary" onClick={load} loading={loading}>Calcular</Btn>
      </div>
      {error && <Alert>{error}</Alert>}
      {data && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard icon="target-arrow" label="Precisión de predicción" value={`${data.precision_porcentaje}%`} color="#FF9900" />
          <Card style={{ flex: 2, minWidth: 260, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ margin: 0, fontSize: 14 }}>{data.mensaje}</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: C.textSec }}>{data.planes_cumplidos} de {data.total_planes} planificaciones se cumplieron con asistencia real.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
