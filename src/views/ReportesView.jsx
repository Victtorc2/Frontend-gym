import { useState, useEffect } from "react";
import { C } from "../styles/colors";
import { Card, Spinner, EmptyState } from "../components";
import api from "../services/api";

const endpoints = {
  activos: "/api/reportes/clientes/activos",
  deuda: "/api/reportes/clientes/deuda",
  ingresos: "/api/reportes/ingresos/periodo",
  membresias: "/api/reportes/membresias",
};

const labels = {
  activos: "Clientes activos",
  deuda: "Clientes con deuda",
  ingresos: "Ingresos del período",
  membresias: "Estado de membresías",
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
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(data).map(([k, v]) => {
          if (Array.isArray(v)) {
            return (
              <div key={k} style={{ marginTop: 8 }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: C.textSec, fontWeight: 500 }}>{k.replace(/_/g, " ")}</p>
                {v.slice(0, 10).map((item, i) => (
                  <Card key={i} style={{ marginBottom: 6, padding: "10px 14px" }}>
                    <pre style={{ margin: 0, fontSize: 11, color: C.textSec, overflow: "auto" }}>{JSON.stringify(item, null, 2)}</pre>
                  </Card>
                ))}
                {v.length > 10 && <p style={{ fontSize: 12, color: C.textSec }}>... y {v.length - 10} más</p>}
              </div>
            );
          }
          if (typeof v === "object" && v !== null) return null;
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.textSec }}>{k.replace(/_/g, " ")}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{String(v)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>Reportes</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {Object.entries(labels).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              fontWeight: tab === k ? 500 : 400,
              border: `0.5px solid ${tab === k ? "var(--color-border-info)" : C.borderSec}`,
              background: tab === k ? C.info : "transparent",
              color: tab === k ? C.infoText : C.text,
            }}
          >
            {v}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : renderData()}
    </div>
  );
}
