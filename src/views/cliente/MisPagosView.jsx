import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Row, Badge, Alert, Spinner, EmptyState, StatusBadge, PageHeader, StatCard, Avatar } from "../../components";
import api from "../../services/api";

const metodoLabel = { efectivo: "Efectivo", transferencia: "Transferencia", yape: "Yape", plin: "Plin" };

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
      <PageHeader icon="cash" title="Mis pagos" subtitle="Historial y estado de tus pagos" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        <StatCard icon="receipt" label="Total de pagos" value={pagos.total_pagos} color="#42a5f5" />
        <StatCard icon="cash" label="Total pagado" value={`S/. ${pagos.total_pagado}`} color="#66bb6a" />
        <StatCard icon="alert-triangle" label="Deuda pendiente" value={`S/. ${pagos.deuda_pendiente}`} color={Number(pagos.deuda_pendiente) > 0 ? "#ef5350" : "#FFD600"} />
      </div>

      {deuda?.tiene_deuda && (
        <Alert>
          <i className="ti ti-alert-triangle" style={{ marginRight: 6 }} />
          {deuda.mensaje} — {deuda.pagos_pendientes} pendiente(s), {deuda.pagos_vencidos} vencido(s)
        </Alert>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "20px 0 8px", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Historial de pagos
      </h3>
      {pagos.pagos.length === 0 ? <EmptyState icon="cash" text="Aún no tienes pagos registrados" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagos.pagos.map(p => (
            <Row key={p.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar><i className="ti ti-receipt-2" style={{ fontSize: 16 }} /></Avatar>
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
              </div>
            </Row>
          ))}
        </div>
      )}
    </div>
  );
}
