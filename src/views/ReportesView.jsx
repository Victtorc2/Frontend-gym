import { useState, useEffect } from "react";
import { Btn, Spinner, EmptyState, PageHeader, StatCard, DataTable, Pagination, paginate } from "../components";
import api from "../services/api";

const endpoints = {
  activos: "/api/reportes/clientes/activos",
  deuda: "/api/reportes/clientes/deuda",
  pagos: "/api/reportes/pagos/resumen",
  membresias: "/api/reportes/membresias/vigentes",
};

const tabs = [
  { id: "activos", label: "Clientes activos", icon: "user-check" },
  { id: "deuda", label: "Clientes con deuda", icon: "alert-triangle" },
  { id: "pagos", label: "Resumen de pagos", icon: "cash" },
  { id: "membresias", label: "Membresías vigentes", icon: "id-badge" },
];

const palette = ["#FFD600", "#2563eb", "#16a34a", "#ab47bc", "#26a69a", "#e5484d"];

const iconForKey = (k) => {
  if (k.includes("deuda") || k.includes("pendiente") || k.includes("vencid")) return "alert-triangle";
  if (k.includes("monto") || k.includes("pago") || k.includes("ingreso") || k.includes("precio")) return "cash";
  if (k.includes("membres")) return "id-badge";
  if (k.includes("cliente")) return "users";
  if (k.includes("porcentaje")) return "percentage";
  return "chart-bar";
};

const sectionTitle = {
  fontSize: 14, fontWeight: 700, marginBottom: 10,
  fontFamily: "'Barlow Condensed', sans-serif",
  textTransform: "uppercase", letterSpacing: "0.04em",
};

const fmt = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

// Tabla de un reporte con su propia paginación (10 filas)
function ReportTable({ title, rows }) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [rows]);

  if (!rows || rows.length === 0) {
    return (
      <div style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>{title}</h3>
        <EmptyState icon="inbox" text="Sin registros" />
      </div>
    );
  }

  const columns = Object.keys(rows[0]).map(k => ({
    key: k,
    label: k.replace(/_/g, " "),
    render: (v) => fmt(v),
  }));
  const pg = paginate(rows, page);

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={sectionTitle}>{title} ({rows.length})</h3>
      <DataTable columns={columns} rows={pg.slice} />
      <Pagination {...pg} onPage={setPage} unit="registros" />
    </div>
  );
}

export default function ReportesView() {
  const [tab, setTab] = useState("activos");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    api.get(endpoints[tab])
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const renderData = () => {
    if (!data) return <EmptyState icon="chart-bar" text="Sin datos disponibles" />;

    const scalarEntries = Object.entries(data).filter(([, v]) => typeof v !== "object" || v === null);
    const arrayEntries = Object.entries(data).filter(([, v]) => Array.isArray(v));

    if (scalarEntries.length === 0 && arrayEntries.length === 0) {
      return <EmptyState icon="chart-bar" text="Sin datos disponibles" />;
    }

    return (
      <>
        {scalarEntries.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            {scalarEntries.map(([k, v], i) => (
              <StatCard key={k} icon={iconForKey(k)} label={k.replace(/_/g, " ")} value={fmt(v)} color={palette[i % palette.length]} />
            ))}
          </div>
        )}

        {arrayEntries.map(([k, v]) => (
          <ReportTable key={k} title={k.replace(/_/g, " ")} rows={v} />
        ))}
      </>
    );
  };

  return (
    <div>
      <PageHeader icon="report-analytics" title="Reportes" subtitle="Informes detallados del sistema en formato de tabla" />

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <Btn
            key={t.id}
            variant={tab === t.id ? "primary" : "default"}
            className={tab === t.id ? "tab-btn active" : "tab-btn"}
            onClick={() => setTab(t.id)}
          >
            <i className={`ti ti-${t.icon}`} /> {t.label}
          </Btn>
        ))}
      </div>

      {loading ? <Spinner /> : renderData()}
    </div>
  );
}
