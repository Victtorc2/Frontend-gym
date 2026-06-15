import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Alert, Spinner, EmptyState, StatusBadge } from "../../components";
import api from "../../services/api";

const metodoLabel = { efectivo: "Efectivo", transferencia: "Transferencia", yape: "Yape", plin: "Plin" };

const statLabel = { fontSize: 12, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em" };
const statValue = { fontSize: 28, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", marginTop: 4 };

export default function MisPagosView() {
  const [pagos, setPagos] = useState(null);
  const [deuda, setDeuda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/cliente/mis-pagos"),
      api.get("/api/cliente/mi-deuda"),
    ]).then(([p, d]) => {
      if (p.status === "fulfilled") setPagos(p.value.data);
      else setError(p.reason.message);
      if (d.status === "fulfilled") setDeuda(d.value.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="cash" text={error} />;
  if (!pagos) return null;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mis Pagos</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={statLabel}>Total de pagos</div>
          <div style={statValue}>{pagos.total_pagos}</div>
        </Card>
        <Card>
          <div style={statLabel}>Total pagado</div>
          <div style={statValue}>S/. {pagos.total_pagado}</div>
        </Card>
        <Card>
          <div style={statLabel}>Deuda pendiente</div>
          <div style={{ ...statValue, color: Number(pagos.deuda_pendiente) > 0 ? "#e53935" : C.text }}>S/. {pagos.deuda_pendiente}</div>
        </Card>
      </div>

      {deuda?.tiene_deuda && (
        <Alert>
          <i className="ti ti-alert-triangle" style={{ marginRight: 6 }} />
          {deuda.mensaje} — {deuda.pagos_pendientes} pendiente(s), {deuda.pagos_vencidos} vencido(s)
        </Alert>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 600, margin: "20px 0 8px" }}>Historial de pagos</h3>
      {pagos.pagos.length === 0 ? <EmptyState icon="cash" text="Aún no tienes pagos registrados" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagos.pagos.map(p => (
            <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Badge type="neutral">{metodoLabel[p.metodo_pago] || p.metodo_pago}</Badge>
                  <StatusBadge estado={p.estado} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                  {p.fecha_pago} · S/. {p.monto_pagado} / {p.monto_total}
                  {Number(p.saldo_pendiente) > 0 && <span style={{ color: C.dangerText }}> · Saldo: S/. {p.saldo_pendiente}</span>}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
