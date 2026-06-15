import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Spinner, EmptyState, StatusBadge } from "../components";
import api from "../services/api";

const actividadBadge = { activo: "success", poco_activo: "warning", inactivo: "neutral" };
const financieroBadge = { sin_deuda: "success", con_deuda: "danger" };

const selectStyle = { padding: "7px 10px", borderRadius: 8, border: `0.5px solid ${C.borderSec}`, background: C.bg, color: C.text, fontSize: 13 };
const cardLabel = { fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 };

export default function SegmentacionView() {
  const [resumen, setResumen] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const [filters, setFilters] = useState({ sexo: "", grupo_edad: "", segmento_actividad: "", segmento_financiero: "", edad_min: "", edad_max: "" });

  useEffect(() => {
    api.get("/api/segmentacion/resumen")
      .then(res => setResumen(res.data))
      .catch(() => {})
      .finally(() => setLoadingResumen(false));
  }, []);

  const load = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const qs = params.toString();
      const res = await api.get(`/api/segmentacion/clientes${qs ? `?${qs}` : ""}`);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setClientes([]);
    }
    setLoadingClientes(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const update = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Segmentación de Clientes</h2>
      </div>

      {loadingResumen ? <Spinner /> : resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Card>
            <div style={cardLabel}>Clientes activos</div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>{resumen.total_clientes_activos}</div>
          </Card>
          <Card>
            <div style={cardLabel}>Demográfico</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div>Masculino: <b>{resumen.demografico.masculino}</b> · Femenino: <b>{resumen.demografico.femenino}</b> · Otro: <b>{resumen.demografico.otro}</b></div>
              <div>Jóvenes: <b>{resumen.demografico.joven}</b> · Adultos: <b>{resumen.demografico.adulto}</b></div>
            </div>
          </Card>
          <Card>
            <div style={cardLabel}>Actividad</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge type="success">Activos: {resumen.actividad.activo}</Badge>
              <Badge type="warning">Poco activos: {resumen.actividad.poco_activo}</Badge>
              <Badge type="neutral">Inactivos: {resumen.actividad.inactivo}</Badge>
            </div>
          </Card>
          <Card>
            <div style={cardLabel}>Financiero</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <Badge type="success">Sin deuda: {resumen.financiero.sin_deuda}</Badge>
              <Badge type="danger">Con deuda: {resumen.financiero.con_deuda}</Badge>
            </div>
            <div style={{ fontSize: 13, color: C.dangerText }}>Deuda total del sistema: S/. {resumen.financiero.deuda_total_sistema}</div>
          </Card>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select value={filters.sexo} onChange={e => update("sexo", e.target.value)} style={selectStyle}>
          <option value="">Todos los sexos</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
        <select value={filters.grupo_edad} onChange={e => update("grupo_edad", e.target.value)} style={selectStyle}>
          <option value="">Todas las edades</option>
          <option value="joven">Joven (14-25)</option>
          <option value="adulto">Adulto (26+)</option>
        </select>
        <select value={filters.segmento_actividad} onChange={e => update("segmento_actividad", e.target.value)} style={selectStyle}>
          <option value="">Toda actividad</option>
          <option value="activo">Activo</option>
          <option value="poco_activo">Poco activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select value={filters.segmento_financiero} onChange={e => update("segmento_financiero", e.target.value)} style={selectStyle}>
          <option value="">Todo financiero</option>
          <option value="sin_deuda">Sin deuda</option>
          <option value="con_deuda">Con deuda</option>
        </select>
        <input type="number" placeholder="Edad mín." value={filters.edad_min} onChange={e => update("edad_min", e.target.value)} style={{ ...selectStyle, width: 100 }} />
        <input type="number" placeholder="Edad máx." value={filters.edad_max} onChange={e => update("edad_max", e.target.value)} style={{ ...selectStyle, width: 100 }} />
      </div>

      {loadingClientes ? <Spinner /> : clientes.length === 0 ? <EmptyState icon="chart-pie" text="No se encontraron clientes" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clientes.map(c => (
            <Card key={c.cliente_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{c.nombres} {c.apellidos}</span>
                  <Badge type="neutral">{c.dni}</Badge>
                  <StatusBadge estado={c.estado} />
                  <Badge type={actividadBadge[c.segmento_actividad] || "neutral"}>{c.segmento_actividad}</Badge>
                  <Badge type={financieroBadge[c.segmento_financiero] || "neutral"}>{c.segmento_financiero}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                  {c.sexo} · {c.edad} años ({c.grupo_edad}) · {c.asistencias_mes_actual} asistencias este mes
                  {c.ultimo_ingreso ? ` · Último ingreso: ${c.ultimo_ingreso}` : ""}
                  {Number(c.deuda_total) > 0 ? ` · Deuda: S/. ${c.deuda_total}` : ""}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
