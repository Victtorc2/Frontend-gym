import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Alert, Spinner, EmptyState, Modal, PageHeader, FilterInput, Row } from "../components";
import api from "../services/api";

const NIVEL_BADGE = { BAJA: "success", MEDIA: "warning", ALTA: "danger" };

export default function RecomendarClienteView() {
  const [buscar, setBuscar] = useState("");
  const [cands, setCands] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [asignadas, setAsignadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "50" });
      if (buscar) params.set("buscar", buscar);
      const [c, s, a] = await Promise.allSettled([
        api.get(`/api/recomendaciones-cliente/candidatos?${params}`),
        api.get("/api/recomendaciones-cliente/sugerencias?limit=15"),
        api.get("/api/recomendaciones-cliente?per_page=50&estado=activa"),
      ]);
      setCands(c.status === "fulfilled" ? c.value.data.items : []);
      setSugerencias(s.status === "fulfilled" ? s.value.data : []);
      setAsignadas(a.status === "fulfilled" ? a.value.data.items : []);
    } catch { /* noop */ }
    setLoading(false);
  }, [buscar]);
  useEffect(() => { load(); }, [load]);

  const openAssign = (cand) => { setModal(cand); setSel(null); setMensaje(""); setError(""); };

  const assign = async () => {
    if (sel === null) { setError("Elige un horario sugerido"); return; }
    const b = sugerencias[sel];
    setSaving(true); setError("");
    try {
      await api.post("/api/recomendaciones-cliente", {
        cliente_id: modal.cliente_id, dia_semana: b.dia_semana,
        hora_inicio: b.hora_inicio, hora_fin: b.hora_fin, mensaje: mensaje || null,
      });
      setModal(null); load();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const descartar = async (id) => {
    if (!confirm("¿Descartar esta recomendación?")) return;
    try { await api.del(`/api/recomendaciones-cliente/${id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="user-star" title="Recomendar a clientes" subtitle="Sugiere horarios de baja concurrencia a cada cliente"
        actions={<FilterInput placeholder="Buscar por nombre o DNI..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: 220 }} />} />

      {loading ? <Spinner /> : (
        <>
          {sugerencias.length === 0 && <Alert>No hay horarios de baja concurrencia. Genera primero el análisis de afluencia en "Horarios Recomendados".</Alert>}

          {asignadas.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Recomendaciones activas ({asignadas.length})</h3>
              {asignadas.map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, gap: 8 }}>
                  <span style={{ fontSize: 13 }}><b>{a.cliente_nombre}</b> → <span style={{ textTransform: "capitalize" }}>{a.dia_semana} {a.horario}</span></span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge type="neutral">{a.origen}</Badge>
                    <Btn variant="danger" onClick={() => descartar(a.id)}><i className="ti ti-x" /></Btn>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {cands.length === 0 ? <EmptyState icon="users" text="Sin clientes" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cands.map(c => (
                <Row key={c.cliente_id}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{c.nombres} {c.apellidos}</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>DNI: {c.dni} · Hora habitual: {c.hora_habitual || "—"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.viene_en_hora_pico && <Badge type="danger">hora pico</Badge>}
                    {c.tiene_recomendacion_activa && <Badge type="success">ya recomendado</Badge>}
                    <Btn variant="primary" onClick={() => openAssign(c)} disabled={sugerencias.length === 0}><i className="ti ti-clock-plus" /> Recomendar</Btn>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal title={`Recomendar a ${modal.nombres} ${modal.apellidos}`} onClose={() => setModal(null)} width={520}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: C.textSec }}>Elige un horario con poca gente:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflow: "auto" }}>
            {sugerencias.map((b, i) => (
              <button key={i} type="button" onClick={() => setSel(i)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                  border: sel === i ? "2px solid #FFD600" : `1px solid ${C.borderSec}`, background: sel === i ? "rgba(255,214,0,0.15)" : C.bgSec, textAlign: "left", color: C.text }}>
                <span style={{ fontSize: 13, textTransform: "capitalize" }}>{b.dia_semana} · {b.horario}</span>
                <span style={{ fontSize: 12, color: C.textSec, display: "inline-flex", alignItems: "center", gap: 6 }}>~{Math.round(b.cantidad_promedio)} pers. <Badge type={NIVEL_BADGE[b.nivel_afluencia]}>{b.nivel_afluencia}</Badge></span>
              </button>
            ))}
          </div>
          <textarea placeholder="Mensaje para el cliente (opcional)" value={mensaje} onChange={e => setMensaje(e.target.value)}
            style={{ width: "100%", marginTop: 12, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 14, fontFamily: "inherit", minHeight: 60, resize: "vertical" }} />
          {error && <Alert>{error}</Alert>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <Btn onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn variant="primary" onClick={assign} loading={saving}>Asignar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
