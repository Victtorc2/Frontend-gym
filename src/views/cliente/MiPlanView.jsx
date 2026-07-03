import { useState, useEffect, useCallback } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Btn, Alert, Spinner, PageHeader } from "../../components";
import api from "../../services/api";

const ZONAS = ["pecho", "espalda", "piernas", "gluteos", "biceps", "triceps", "hombros", "abdomen", "cardio"];
const NIVEL_BADGE = { bajo: "success", medio: "warning", alto: "warning", muy_alto: "danger" };
const ESTADO_BADGE = { planeado: "info", confirmado: "success", en_camino: "warning", cancelado: "neutral" };
const today = () => new Date().toISOString().slice(0, 10);
const fieldInput = { padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 14 };

export default function MiPlanView() {
  const [plan, setPlan] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fecha: today(), hora_inicio: "18:00", zonas: [], rutina_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checkinHora, setCheckinHora] = useState("18:00");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [h, r] = await Promise.allSettled([api.get("/api/mi-plan/hoy"), api.get("/api/mi-plan/rutinas")]);
      setPlan(h.status === "fulfilled" ? h.value.data : null);
      setRutinas(r.status === "fulfilled" ? (r.value.data.items || []) : []);
    } catch { /* noop */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleZona = (z) => setForm(f => ({ ...f, zonas: f.zonas.includes(z) ? f.zonas.filter(x => x !== z) : [...f.zonas, z] }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.zonas.length === 0 && !form.rutina_id) { setError("Elige al menos una zona o una rutina"); return; }
    setSaving(true); setError("");
    try {
      await api.post("/api/mi-plan", {
        fecha: form.fecha, hora_inicio: form.hora_inicio, zonas: form.zonas,
        rutina_id: form.rutina_id ? Number(form.rutina_id) : null,
      });
      load();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const doCheckin = async () => {
    setCheckinLoading(true);
    try { await api.post("/api/mi-plan/checkin", { hora_inicio: checkinHora }); load(); }
    catch (err) { alert(err.message); }
    setCheckinLoading(false);
  };

  const cambiarEstado = async (estado) => { try { await api.patch("/api/mi-plan/estado", { estado }); load(); } catch (err) { alert(err.message); } };
  const eliminar = async () => { if (!confirm("¿Eliminar tu plan de hoy?")) return; try { await api.del("/api/mi-plan/hoy"); setPlan(null); load(); } catch (err) { alert(err.message); } };

  if (loading) return <Spinner />;
  const hoy = plan && plan.fecha === today();

  return (
    <div>
      <PageHeader icon="clipboard-check" title="Mi plan" subtitle="Planifica tu entrenamiento y evita las horas llenas" />

      {/* Check-in rápido: solo la hora */}
      {!hoy && (
        <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", borderLeft: "4px solid #FFD600" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}><i className="ti ti-hand-click" /> ¿Vas a venir hoy?</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: C.textSec }}>Dinos a qué hora para ayudarnos a controlar la afluencia.</p>
          </div>
          <input type="time" value={checkinHora} onChange={e => setCheckinHora(e.target.value)} style={fieldInput} />
          <Btn variant="primary" loading={checkinLoading} onClick={doCheckin}><i className="ti ti-check" /> Confirmar asistencia de hoy</Btn>
        </Card>
      )}

      {hoy && (
        <Card style={{ borderLeft: "4px solid #FFD600", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}><i className="ti ti-calendar-check" /> Tu plan de hoy · {plan.hora_inicio}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: C.textSec }}>{plan.mensaje}</p>
            </div>
            <Badge type={ESTADO_BADGE[plan.estado]}>{plan.estado.replace("_", " ")}</Badge>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
            {plan.zonas.map(z => <Badge key={z} type="info">{z}</Badge>)}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: C.textSec }}><i className="ti ti-barbell" /> {plan.maquinas.map(m => m.nombre).join(", ")}</p>

          {plan.avisos_demanda.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {plan.avisos_demanda.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(239,68,68,0.10)", borderRadius: 8, marginBottom: 6 }}>
                  <i className="ti ti-alert-triangle" style={{ color: "#b91c1c" }} />
                  <span style={{ fontSize: 13, flex: 1 }}>{a.mensaje}</span>
                  <Badge type={NIVEL_BADGE[a.nivel]}>{a.nivel.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          )}
          {plan.sugerencia_orden && (
            <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(34,197,94,0.10)", borderRadius: 8, fontSize: 13 }}>
              <i className="ti ti-bulb" style={{ color: "#15803d" }} /> {plan.sugerencia_orden}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {plan.estado === "planeado" && <Btn variant="primary" onClick={() => cambiarEstado("confirmado")}><i className="ti ti-check" /> Confirmar asistencia</Btn>}
            {plan.estado === "confirmado" && <Btn variant="primary" onClick={() => cambiarEstado("en_camino")}><i className="ti ti-walk" /> Voy en camino</Btn>}
            {plan.estado !== "cancelado" && <Btn onClick={() => cambiarEstado("cancelado")}>Cancelar asistencia</Btn>}
            <Btn variant="danger" onClick={eliminar}><i className="ti ti-trash" /> Eliminar plan</Btn>
          </div>
        </Card>
      )}

      <Card>
        <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{hoy ? "Modificar mi plan" : "Planificar mi entrenamiento"}</h3>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: C.textSec }}>No es una reserva: nos ayuda a anticipar la demanda de máquinas.</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: C.textSec }}>Fecha<br /><input type="date" value={form.fecha} min={today()} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={{ ...fieldInput, marginTop: 4 }} /></label>
            <label style={{ fontSize: 12, color: C.textSec }}>Hora<br /><input type="time" value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} style={{ ...fieldInput, marginTop: 4 }} /></label>
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Zonas a entrenar</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {ZONAS.map(z => {
                const on = form.zonas.includes(z);
                return (
                  <button type="button" key={z} onClick={() => toggleZona(z)}
                    style={{ padding: "7px 13px", borderRadius: 20, fontSize: 13, cursor: "pointer", textTransform: "capitalize",
                      border: on ? "1.5px solid #FFD600" : `1.5px solid ${C.borderSec}`, background: on ? "rgba(255,214,0,0.15)" : C.bgSec, color: C.text, fontWeight: on ? 700 : 500 }}>
                    {on && <i className="ti ti-check" style={{ marginRight: 4 }} />}{z}
                  </button>
                );
              })}
            </div>
          </div>
          {rutinas.length > 0 && (
            <label style={{ fontSize: 12, color: C.textSec }}>O elige una rutina de tu entrenador<br />
              <select value={form.rutina_id} onChange={e => setForm(f => ({ ...f, rutina_id: e.target.value }))} style={{ ...fieldInput, marginTop: 4, minWidth: 260 }}>
                <option value="">— Ninguna —</option>
                {rutinas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </label>
          )}
          {error && <Alert>{error}</Alert>}
          <div><Btn type="submit" variant="primary" loading={saving}><i className="ti ti-device-floppy" /> Guardar plan</Btn></div>
        </form>
      </Card>
    </div>
  );
}
