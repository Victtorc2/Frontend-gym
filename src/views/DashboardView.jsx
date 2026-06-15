import { useState, useEffect } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { C } from "../styles/colors";
import { Card, Spinner, EmptyState, PageHeader, StatCard } from "../components";
import api from "../services/api";

const AXIS_COLOR = "#666666";
const GRID_COLOR = "#e0e0e0";

const TOOLTIP_STYLE = {
  contentStyle: { background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 8 },
  labelStyle: { color: "#1a1a1a" },
  itemStyle: { color: "#1a1a1a" },
};
const LEGEND_STYLE = { color: "#666666" };

const DIA_ORDER = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DIA_LABELS = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb" };

const TIPO_LABELS = { mensual: "Mensual", anual: "Anual", diario: "Diario" };
const TIPO_COLORS = { mensual: "#FFD600", anual: "#757575", diario: "#42a5f5" };

const ACTIVIDAD_LABELS = { activo: "Activo", poco_activo: "Poco activo", inactivo: "Inactivo" };
const ACTIVIDAD_COLORS = { activo: "#4caf50", poco_activo: "#FFD600", inactivo: "#9e9e9e" };

const METODO_LABELS = { efectivo: "Efectivo", transferencia: "Transferencia", yape: "Yape", plin: "Plin" };

const chartTitle = { fontSize: 13, fontWeight: 600, marginBottom: 12, color: C.text };

function formatSoles(value) {
  return `S/. ${Number(value).toFixed(2)}`;
}

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [asistenciasPorDia, setAsistenciasPorDia] = useState(null);
  const [segmentacionActividad, setSegmentacionActividad] = useState(null);
  const [membresiasPorTipo, setMembresiasPorTipo] = useState(null);
  const [ingresosPorMetodo, setIngresosPorMetodo] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/clientes?per_page=1"),
      api.get("/api/membresias?estado=activa"),
      api.get("/api/asistencias?per_page=1"),
      api.get("/api/reportes/clientes/activos"),
      api.get("/api/segmentacion/resumen"),
      api.get("/api/recomendaciones/estadisticas"),
      api.get("/api/reportes/membresias/vigentes"),
      api.get("/api/reportes/pagos/resumen"),
    ]).then(([clients, mems, att, reportActivos, segResumen, recoStats, repMembresias, repPagos]) => {
      setStats({
        totalClientes: clients.value?.data?.total ?? "—",
        membresíasActivas: Array.isArray(mems.value?.data) ? mems.value.data.length : "—",
        totalAsistencias: att.value?.data?.total ?? "—",
        clientesActivos: reportActivos.value?.data?.total_activos ?? "—",
        ingresosTotales: repPagos.value?.data?.total_ingresos ?? null,
        clientesConDeuda: segResumen.value?.data?.financiero?.con_deuda ?? "—",
      });

      // Asistencias por día de la semana (lunes a sábado)
      if (recoStats.status === "fulfilled") {
        const porDia = recoStats.value?.data?.por_dia || [];
        setAsistenciasPorDia(
          DIA_ORDER.map(dia => ({
            dia: DIA_LABELS[dia],
            total: porDia.find(d => d.dia_semana === dia)?.total_ingresos ?? 0,
          }))
        );
      } else {
        setAsistenciasPorDia([]);
      }

      // Segmentación de actividad
      const actividad = segResumen.value?.data?.actividad;
      if (actividad && actividad.total > 0) {
        setSegmentacionActividad(
          Object.keys(ACTIVIDAD_LABELS)
            .map(key => ({ key, name: ACTIVIDAD_LABELS[key], value: actividad[key] ?? 0 }))
            .filter(d => d.value > 0)
        );
      } else {
        setSegmentacionActividad([]);
      }

      // Membresías por tipo
      const porTipo = repMembresias.value?.data?.por_tipo || {};
      setMembresiasPorTipo(
        Object.entries(porTipo)
          .filter(([, cantidad]) => cantidad > 0)
          .map(([tipo, cantidad]) => ({ key: tipo, name: TIPO_LABELS[tipo] || tipo, value: cantidad }))
      );

      // Ingresos por método de pago
      const porMetodo = repPagos.value?.data?.por_metodo || {};
      setIngresosPorMetodo(
        Object.entries(porMetodo)
          .filter(([, monto]) => Number(monto) > 0)
          .map(([metodo, monto]) => ({ metodo: METODO_LABELS[metodo] || metodo, monto: Number(monto) }))
      );

      setLoading(false);
    });
  }, []);

  const metrics = [
    { icon: "users",          label: "Clientes totales",   value: stats?.totalClientes, color: "#FFD600" },
    { icon: "id-badge",       label: "Membresías activas", value: stats?.membresíasActivas, color: "#42a5f5" },
    { icon: "activity",       label: "Total asistencias",  value: stats?.totalAsistencias, color: "#66bb6a" },
    { icon: "user-check",     label: "Clientes activos",   value: stats?.clientesActivos, color: "#ab47bc" },
    { icon: "cash",           label: "Ingresos totales",   value: stats?.ingresosTotales != null ? formatSoles(stats.ingresosTotales) : "—", color: "#26a69a" },
    { icon: "alert-triangle", label: "Clientes con deuda", value: stats?.clientesConDeuda, color: "#ef5350" },
  ];

  return (
    <div>
      <PageHeader icon="layout-dashboard" title="Panel principal" subtitle="Resumen general del sistema" />

      {loading ? <Spinner /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {metrics.map(m => (
              <StatCard key={m.label} icon={m.icon} label={m.label} value={m.value ?? "—"} color={m.color} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            <Card>
              <div style={chartTitle}>Asistencias por día de la semana</div>
              {asistenciasPorDia === null ? <Spinner /> : asistenciasPorDia.length === 0 || asistenciasPorDia.every(d => d.total === 0) ? (
                <EmptyState icon="chart-bar" text="Sin datos. Genera el análisis en Horarios Recomendados." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={asistenciasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="dia" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="total" name="Asistencias" fill="#FFD600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <div style={chartTitle}>Segmentación de actividad</div>
              {segmentacionActividad === null ? <Spinner /> : segmentacionActividad.length === 0 ? (
                <EmptyState icon="users" text="Sin clientes activos para segmentar." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={segmentacionActividad} dataKey="value" nameKey="name" outerRadius={90} label={({ value }) => value}>
                      {segmentacionActividad.map(d => (
                        <Cell key={d.key} fill={ACTIVIDAD_COLORS[d.key]} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <div style={chartTitle}>Membresías por tipo</div>
              {membresiasPorTipo === null ? <Spinner /> : membresiasPorTipo.length === 0 ? (
                <EmptyState icon="id-badge" text="Sin membresías vigentes." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={membresiasPorTipo} dataKey="value" nameKey="name" outerRadius={90} label={({ value }) => value}>
                      {membresiasPorTipo.map(d => (
                        <Cell key={d.key} fill={TIPO_COLORS[d.key] || "#9e9e9e"} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <div style={chartTitle}>Ingresos por método de pago</div>
              {ingresosPorMetodo === null ? <Spinner /> : ingresosPorMetodo.length === 0 ? (
                <EmptyState icon="cash" text="Sin pagos registrados." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ingresosPorMetodo}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="metodo" tick={{ fill: AXIS_COLOR, fontSize: 12 }} />
                    <YAxis tick={{ fill: AXIS_COLOR, fontSize: 12 }} tickFormatter={(v) => `S/.${v}`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(value) => formatSoles(value)} />
                    <Bar dataKey="monto" name="Ingresos" fill="#42a5f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
