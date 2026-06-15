import { useState, useEffect } from "react";
import { C } from "../styles/colors";
import { Row, Btn, Spinner, EmptyState, PageHeader, StatCard, DetailField } from "../components";
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

const palette = ["#FFD600", "#42a5f5", "#66bb6a", "#ab47bc", "#26a69a", "#ef5350"];

const iconForKey = (k) => {
  if (k.includes("deuda") || k.includes("pendiente") || k.includes("vencid")) return "alert-triangle";
  if (k.includes("monto") || k.includes("pago") || k.includes("ingreso") || k.includes("precio")) return "cash";
  if (k.includes("membres")) return "id-badge";
  if (k.includes("cliente")) return "users";
  if (k.includes("porcentaje")) return "percentage";
  return "chart-bar";
};

const sectionTitle = {
  fontSize: 14, fontWeight: 700, marginBottom: 8,
  fontFamily: "'Barlow Condensed', sans-serif",
  textTransform: "uppercase", letterSpacing: "0.04em",
};

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
              <StatCard key={k} icon={iconForKey(k)} label={k.replace(/_/g, " ")} value={String(v)} color={palette[i % palette.length]} />
            ))}
          </div>
        )}

        {arrayEntries.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 24 }}>
            <h3 style={sectionTitle}>{k.replace(/_/g, " ")} ({v.length})</h3>
            {v.length === 0 ? <EmptyState icon="inbox" text="Sin registros" /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {v.slice(0, 15).map((item, i) => (
                  <Row key={i}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, width: "100%" }}>
                      {Object.entries(item).map(([fk, fv]) => (
                        <DetailField key={fk} label={fk.replace(/_/g, " ")} value={typeof fv === "object" && fv !== null ? JSON.stringify(fv) : String(fv)} />
                      ))}
                    </div>
                  </Row>
                ))}
                {v.length > 15 && (
                  <p style={{ fontSize: 12, color: C.textSec, textAlign: "center", margin: "4px 0 0" }}>... y {v.length - 15} más</p>
                )}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div>
      <PageHeader icon="report-analytics" title="Reportes" subtitle="Informes detallados del sistema" />

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
