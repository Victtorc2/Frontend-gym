import { useState, useEffect, useCallback } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Btn, Alert, Spinner, EmptyState, Modal, PageHeader, FilterSelect } from "../../components";
import api, { mediaUrl } from "../../services/api";

const ZONAS = ["pecho", "espalda", "piernas", "gluteos", "biceps", "triceps", "hombros", "abdomen", "cardio"];
const DURACIONES = [15, 30, 45, 60, 90, 120];
const today = () => new Date().toISOString().slice(0, 10);
const dateInput = { padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 13 };

// Color del badge de un tramo: verde si es tuyo, rojo si está lleno, ámbar si quedan libres.
const tramoType = (t) => (t.es_mia ? "success" : t.libres === 0 ? "danger" : "warning");
// Texto del tramo: muestra la capacidad restante cuando la máquina tiene varias unidades.
const tramoLabel = (t, cantidad) => {
  const rango = `${t.hora_inicio}–${t.hora_fin}`;
  if (t.es_mia) return `${rango} · Tú`;
  if (t.libres === 0) return `${rango} · ${cantidad > 1 ? "Lleno" : "Ocupado"}`;
  return `${rango} · ${t.libres}/${cantidad} libres`;
};

export default function ReservasView() {
  const [fecha, setFecha] = useState(today());
  const [zona, setZona] = useState("");
  const [planZonas, setPlanZonas] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // máquina a reservar
  const [form, setForm] = useState({ hora_inicio: "18:00", duracion_min: 30 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ fecha });
      if (zona) params.set("zonas", zona);
      const [maq, mias, plan] = await Promise.allSettled([
        api.get(`/api/reservas/maquinas?${params}`),
        api.get(`/api/reservas/mias?fecha=${fecha}`),
        fecha === today() ? api.get("/api/mi-plan/hoy") : Promise.resolve({ data: null }),
      ]);
      setMaquinas(maq.status === "fulfilled" ? (maq.value.data || []) : []);
      setMisReservas(mias.status === "fulfilled" ? (mias.value.data || []) : []);
      setPlanZonas(plan.status === "fulfilled" && plan.value.data ? (plan.value.data.zonas || []) : []);
    } catch { /* noop */ }
    setLoading(false);
  }, [fecha, zona]);
  useEffect(() => { load(); }, [load]);

  const openReservar = (m) => { setModal(m); setForm({ hora_inicio: "18:00", duracion_min: 30 }); setError(""); };

  const reservar = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/api/reservas", {
        maquina_id: modal.maquina_id, fecha,
        hora_inicio: form.hora_inicio, duracion_min: Number(form.duracion_min),
      });
      setModal(null); load();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const cancelar = async (r) => {
    if (!confirm(`¿Cancelar tu reserva de ${r.maquina_nombre} (${r.hora_inicio})?`)) return;
    try { await api.del(`/api/reservas/${r.id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="calendar-time" title="Reservar máquina" subtitle="Elige una máquina y una hora libre para entrenar"
        actions={<>
          <input type="date" value={fecha} min={today()} onChange={e => setFecha(e.target.value)} style={dateInput} />
          <FilterSelect value={zona} onChange={e => setZona(e.target.value)}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </FilterSelect>
        </>} />

      {planZonas.length > 0 && !zona && (
        <Alert type="success">
          Tu plan de hoy incluye: {planZonas.join(", ")}. Filtra por esas zonas para ver sus máquinas.
        </Alert>
      )}

      {misReservas.length > 0 && (
        <Card style={{ margin: "12px 0 16px", borderLeft: "4px solid #FFD600" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Mis reservas</h3>
          {misReservas.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, gap: 8 }}>
              <span style={{ fontSize: 13 }}><b>{r.maquina_nombre}</b> · {r.fecha} · {r.hora_inicio}-{r.hora_fin} ({r.duracion_min}m)</span>
              <Btn variant="danger" onClick={() => cancelar(r)}><i className="ti ti-x" /></Btn>
            </div>
          ))}
        </Card>
      )}

      {loading ? <Spinner /> : maquinas.length === 0 ? <EmptyState icon="barbell" text="No hay máquinas disponibles" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {maquinas.map(m => (
            <Card key={m.maquina_id} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 130, background: C.bgSec, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m.foto_url
                  ? <img src={mediaUrl(m.foto_url)} alt={m.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo" style={{ fontSize: 36, color: C.textSec, opacity: 0.5 }} />}
              </div>
              <div style={{ padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{m.nombre}</span>
                  <Badge type="info">{m.zona}</Badge>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {m.cantidad > 1 ? `Disponibilidad · ${m.cantidad} unidades` : "Disponibilidad"}
                  </p>
                  {m.tramos.length === 0 ? (
                    <span style={{ fontSize: 12, color: "#15803d" }}><i className="ti ti-circle-check" /> Todo libre</span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {m.tramos.map((t, i) => (
                        <Badge key={i} type={tramoType(t)}>{tramoLabel(t, m.cantidad)}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Btn variant="info" onClick={() => openReservar(m)}><i className="ti ti-clock-plus" /> Reservar</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={`Reservar: ${modal.nombre}`} onClose={() => setModal(null)} width={420}>
          <form onSubmit={reservar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modal.tramos.length > 0 && (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: C.textSec }}>
                  {modal.cantidad > 1
                    ? `Ocupación actual (${modal.cantidad} unidades a la vez):`
                    : "Franjas ya reservadas:"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {modal.tramos.map((t, i) => <Badge key={i} type={tramoType(t)}>{tramoLabel(t, modal.cantidad)}</Badge>)}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ fontSize: 12, color: C.textSec, flex: 1 }}>Hora de inicio
                <input type="time" value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} required style={{ ...dateInput, display: "block", marginTop: 4, width: "100%", fontSize: 14 }} />
              </label>
              <label style={{ fontSize: 12, color: C.textSec, flex: 1 }}>Duración
                <select value={form.duracion_min} onChange={e => setForm(f => ({ ...f, duracion_min: e.target.value }))} style={{ ...dateInput, display: "block", marginTop: 4, width: "100%", fontSize: 14 }}>
                  {DURACIONES.map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </label>
            </div>
            {error && <Alert>{error}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn type="submit" variant="info" loading={saving}>Reservar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
