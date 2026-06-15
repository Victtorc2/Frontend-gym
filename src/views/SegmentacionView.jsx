import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Spinner, EmptyState, StatusBadge, PageHeader, StatCard, FilterSelect, FilterInput, Row, Avatar } from "../components";
import api from "../services/api";

const actividadBadge = { activo: "success", poco_activo: "warning", inactivo: "neutral" };
const financieroBadge = { sin_deuda: "success", con_deuda: "danger" };

const cardLabel = {
  fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 10, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif",
  display: "flex", alignItems: "center", gap: 6,
};

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
      <PageHeader icon="chart-pie" title="Segmentación de clientes" subtitle="Análisis demográfico, de actividad y financiero" />

      {loadingResumen ? <Spinner /> : resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icon="users-group" label="Clientes activos" value={resumen.total_clientes_activos} color="#FFD600" />
          <Card>
            <div style={cardLabel}><i className="ti ti-gender-bigender" /> Demográfico</div>
            <div style={{ fontSize: 13, lineHeight: 1.9 }}>
              <div>Masculino: <b>{resumen.demografico.masculino}</b> · Femenino: <b>{resumen.demografico.femenino}</b> · Otro: <b>{resumen.demografico.otro}</b></div>
              <div>Jóvenes: <b>{resumen.demografico.joven}</b> · Adultos: <b>{resumen.demografico.adulto}</b></div>
            </div>
          </Card>
          <Card>
            <div style={cardLabel}><i className="ti ti-activity" /> Actividad</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge type="success">Activos: {resumen.actividad.activo}</Badge>
              <Badge type="warning">Poco activos: {resumen.actividad.poco_activo}</Badge>
              <Badge type="neutral">Inactivos: {resumen.actividad.inactivo}</Badge>
            </div>
          </Card>
          <Card>
            <div style={cardLabel}><i className="ti ti-receipt" /> Financiero</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <Badge type="success">Sin deuda: {resumen.financiero.sin_deuda}</Badge>
              <Badge type="danger">Con deuda: {resumen.financiero.con_deuda}</Badge>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dangerText, fontFamily: "'Barlow Condensed', sans-serif" }}>
              S/. {resumen.financiero.deuda_total_sistema}
            </div>
            <div style={{ fontSize: 11, color: C.textSec }}>Deuda total del sistema</div>
          </Card>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <FilterSelect value={filters.sexo} onChange={e => update("sexo", e.target.value)}>
          <option value="">Todos los sexos</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </FilterSelect>
        <FilterSelect value={filters.grupo_edad} onChange={e => update("grupo_edad", e.target.value)}>
          <option value="">Todas las edades</option>
          <option value="joven">Joven (14-25)</option>
          <option value="adulto">Adulto (26+)</option>
        </FilterSelect>
        <FilterSelect value={filters.segmento_actividad} onChange={e => update("segmento_actividad", e.target.value)}>
          <option value="">Toda actividad</option>
          <option value="activo">Activo</option>
          <option value="poco_activo">Poco activo</option>
          <option value="inactivo">Inactivo</option>
        </FilterSelect>
        <FilterSelect value={filters.segmento_financiero} onChange={e => update("segmento_financiero", e.target.value)}>
          <option value="">Todo financiero</option>
          <option value="sin_deuda">Sin deuda</option>
          <option value="con_deuda">Con deuda</option>
        </FilterSelect>
        <FilterInput type="number" placeholder="Edad mín." value={filters.edad_min} onChange={e => update("edad_min", e.target.value)} style={{ width: 100 }} />
        <FilterInput type="number" placeholder="Edad máx." value={filters.edad_max} onChange={e => update("edad_max", e.target.value)} style={{ width: 100 }} />
      </div>

      {loadingClientes ? <Spinner /> : clientes.length === 0 ? <EmptyState icon="chart-pie" text="No se encontraron clientes" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clientes.map(c => (
            <Row key={c.cliente_id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar>{(c.nombres[0] + c.apellidos[0]).toUpperCase()}</Avatar>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.nombres} {c.apellidos}</span>
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
              </div>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
}
