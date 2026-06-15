import { useState, useEffect, useCallback } from "react";
import { C, heatColor } from "../styles/colors";
import { Row, Btn, Input, Alert, Spinner, EmptyState, Modal, StatusBadge, PageHeader, Avatar } from "../components";
import api from "../services/api";

export default function AsistenciasView() {
  const [att, setAtt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/asistencias?per_page=30");
      setAtt(res.data?.items || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const validateEntry = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess(""); setLastResult(null);
    try {
      const res = await api.post("/api/asistencias/validar-ingreso", { codigo_tarjeta: codigo });
      const r = res.data;
      setLastResult(r);
      if (r.acceso_permitido) {
        setSuccess(`Acceso autorizado para ${r.nombre_cliente}`);
      } else {
        setError(`Acceso denegado: ${r.motivo}`);
      }
      load();
      setCodigo("");
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        icon="activity"
        title="Asistencias"
        subtitle="Registro de ingresos validados por tarjeta"
        actions={
          <Btn variant="primary" onClick={() => { setModal(true); setError(""); setSuccess(""); setLastResult(null); }}>
            <i className="ti ti-scan" /> Validar ingreso
          </Btn>
        }
      />

      {loading ? <Spinner /> : att.length === 0 ? <EmptyState icon="activity" text="Sin registros de asistencia" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {att.map(a => {
            const aprobado = a.estado === "aprobado";
            return (
              <Row key={a.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar color={aprobado ? heatColor("BAJA").bg : heatColor("ALTA").bg}>
                    <i className={`ti ti-${aprobado ? "circle-check" : "circle-x"}`} style={{ fontSize: 18, color: aprobado ? "var(--color-text-success)" : "var(--color-text-danger)" }} />
                  </Avatar>
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Cliente #{a.cliente_id}</span>
                      <StatusBadge estado={a.estado} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                      {a.fecha} · {a.hora}
                      {a.motivo_denegacion && ` · ${a.motivo_denegacion}`}
                    </p>
                  </div>
                </div>
              </Row>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Validar ingreso" onClose={() => setModal(false)}>
          <form onSubmit={validateEntry} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <i className="ti ti-scan" style={{ fontSize: 48, color: C.textSec }} />
              <p style={{ margin: "8px 0 0", color: C.textSec, fontSize: 14 }}>Ingresa el código de la tarjeta del cliente</p>
            </div>
            <Input label="Código de tarjeta" value={codigo} onChange={e => setCodigo(e.target.value)} required placeholder="Ej: CARD-001-ABC" autoFocus />
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            {lastResult && (
              <div style={{ background: C.bgSec, borderRadius: 8, padding: "12px", fontSize: 13 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 500 }}>Resultado del acceso</p>
                <p style={{ margin: 0, color: C.textSec }}>
                  {lastResult.acceso_permitido ? "✓ Ingreso autorizado" : `✗ ${lastResult.motivo}`}
                </p>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setModal(false)}>Cerrar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Validar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
