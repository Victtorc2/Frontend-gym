import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Input, Select, Alert, Spinner, EmptyState, Modal, PageHeader, FilterInput, FilterSelect } from "../components";
import api, { mediaUrl } from "../services/api";

const ZONAS = ["pecho", "espalda", "piernas", "gluteos", "biceps", "triceps", "hombros", "abdomen", "cardio"];
const TABS = [
  { id: "operativas", label: "Operativas", icon: "circle-check" },
  { id: "mantenimiento", label: "Mantenimiento", icon: "tools" },
];
const today = () => new Date().toISOString().slice(0, 10);
const dateInput = { padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 13 };

export default function MaquinasView() {
  const [tab, setTab] = useState("operativas");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [zona, setZona] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | machine
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Reservas (control admin) por máquina
  const [reservasModal, setReservasModal] = useState(null); // máquina | null
  const [reservas, setReservas] = useState([]);
  const [reservasLoading, setReservasLoading] = useState(false);
  const [reservasFecha, setReservasFecha] = useState(today());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "200", activa: tab === "operativas" ? "true" : "false" });
      if (buscar) params.set("buscar", buscar);
      if (zona) params.set("zona", zona);
      const res = await api.get(`/api/maquinas?${params}`);
      setItems(res.data.items || []);
    } catch { setItems([]); }
    setLoading(false);
  }, [tab, buscar, zona]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ nombre: "", zona: "pecho", cantidad: 1, descripcion: "", activa: true }); setError(""); setSuccess(""); setModal("create"); };
  const openEdit = (m) => { setForm({ nombre: m.nombre, zona: m.zona, cantidad: m.cantidad, descripcion: m.descripcion || "", activa: m.activa }); setError(""); setSuccess(""); setModal(m); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const body = { ...form, cantidad: Number(form.cantidad) };
      if (modal === "create") await api.post("/api/maquinas", body);
      else await api.put(`/api/maquinas/${modal.id}`, body);
      setSuccess("Guardado correctamente");
      load();
      setTimeout(() => setModal(null), 900);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const uploadPhoto = async (m, file) => {
    if (!file) return;
    setUploading(m.id);
    try { await api.upload(`/api/maquinas/${m.id}/foto`, file); load(); }
    catch (err) { alert(err.message); }
    setUploading(null);
  };

  const toggleMantenimiento = async (m) => {
    try { await api.put(`/api/maquinas/${m.id}`, { activa: !m.activa }); load(); }
    catch (err) { alert(err.message); }
  };

  const remove = async (m) => {
    if (!confirm(`¿ELIMINAR definitivamente la máquina "${m.nombre}"? (distinto de mantenimiento)`)) return;
    try { await api.del(`/api/maquinas/${m.id}`); load(); } catch (err) { alert(err.message); }
  };

  const loadReservas = useCallback(async (machineId, fecha) => {
    setReservasLoading(true);
    try {
      const qs = fecha ? `?fecha=${fecha}` : "";
      const res = await api.get(`/api/maquinas/${machineId}/reservas${qs}`);
      setReservas(res.data || []);
    } catch { setReservas([]); }
    setReservasLoading(false);
  }, []);

  const openReservas = (m) => { setReservasModal(m); setReservasFecha(today()); loadReservas(m.id, today()); };
  const changeReservasFecha = (fecha) => { setReservasFecha(fecha); if (reservasModal) loadReservas(reservasModal.id, fecha); };

  return (
    <div>
      <PageHeader icon="barbell" title="Máquinas" subtitle="Catálogo de equipos, fotos y mantenimiento"
        actions={<>
          <FilterInput placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: 150 }} />
          <FilterSelect value={zona} onChange={e => setZona(e.target.value)}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </FilterSelect>
          <Btn variant="primary" onClick={openCreate}><i className="ti ti-plus" /> Nueva</Btn>
        </>}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem" }}>
        {TABS.map(t => (
          <Btn key={t.id} variant={tab === t.id ? "primary" : "default"} className={tab === t.id ? "tab-btn active" : "tab-btn"} onClick={() => setTab(t.id)}>
            <i className={`ti ti-${t.icon}`} /> {t.label}
          </Btn>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={tab === "operativas" ? "barbell" : "tools"} text={tab === "operativas" ? "No hay máquinas operativas" : "No hay máquinas en mantenimiento"} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {items.map(m => (
            <Card key={m.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0, overflow: "hidden" }}>
              {/* Foto */}
              <div style={{ height: 150, background: C.bgSec, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {m.foto_url
                  ? <img src={mediaUrl(m.foto_url)} alt={m.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo" style={{ fontSize: 40, color: C.textSec, opacity: 0.5 }} />}
                <label style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.65)", color: "#fff", padding: "5px 9px", borderRadius: 7, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <i className="ti ti-camera" /> {uploading === m.id ? "Subiendo..." : "Foto"}
                  <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading === m.id} onChange={e => uploadPhoto(m, e.target.files[0])} />
                </label>
              </div>

              <div style={{ padding: "0 1rem 1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{m.nombre}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSec }}>{m.descripcion || "—"}</p>
                  </div>
                  <Badge type={m.activa ? "success" : "warning"}>{m.activa ? "operativa" : "mantenimiento"}</Badge>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge type="info">{m.zona}</Badge>
                  <span style={{ fontSize: 13, color: C.textSec }}><i className="ti ti-stack-2" /> {m.cantidad} unid.</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 }}>
                  <Btn onClick={() => openReservas(m)}><i className="ti ti-calendar-event" /> Reservas</Btn>
                  <Btn onClick={() => openEdit(m)}><i className="ti ti-edit" /> Editar</Btn>
                  <Btn onClick={() => toggleMantenimiento(m)} variant={m.activa ? "default" : "primary"}>
                    <i className={`ti ti-${m.activa ? "tool" : "circle-check"}`} /> {m.activa ? "A mantenimiento" : "Reactivar"}
                  </Btn>
                  <Btn variant="danger" onClick={() => remove(m)}><i className="ti ti-trash" /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reservasModal && (
        <Modal title={`Reservas: ${reservasModal.nombre}`} onClose={() => setReservasModal(null)} width={560}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: C.textSec }}>Fecha:</span>
              <input type="date" value={reservasFecha} onChange={e => changeReservasFecha(e.target.value)} style={dateInput} />
              {reservasFecha && <Btn onClick={() => changeReservasFecha("")}><i className="ti ti-x" /> Todas</Btn>}
              <span style={{ marginLeft: "auto", fontSize: 12, color: C.textSec }}>
                {reservas.length} reserva{reservas.length === 1 ? "" : "s"} · {reservasModal.cantidad} unid.
              </span>
            </div>

            {reservasLoading ? <Spinner /> : reservas.length === 0 ? (
              <EmptyState icon="calendar-off" text="Sin reservas para este filtro" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {reservas.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 8, background: C.bgSec }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        <i className="ti ti-clock" style={{ marginRight: 4 }} />{r.hora_inicio}–{r.hora_fin}
                        <span style={{ fontWeight: 400, color: C.textSec, marginLeft: 6 }}>({r.duracion_min}m)</span>
                      </span>
                      <span style={{ fontSize: 13 }}>
                        <i className="ti ti-user" style={{ marginRight: 4, color: C.textSec }} />
                        {r.cliente_nombre}{r.cliente_dni ? ` · DNI ${r.cliente_dni}` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <Badge type={r.estado === "activa" ? "success" : "neutral"}>{r.estado}</Badge>
                      {!reservasFecha && <span style={{ fontSize: 11, color: C.textSec }}>{r.fecha}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={() => setReservasModal(null)}>Cerrar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={modal === "create" ? "Nueva máquina" : `Editar: ${modal.nombre}`} onClose={() => setModal(null)} width={480}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nombre" value={form.nombre || ""} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Zona muscular" value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))}>
                {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
              </Select>
              <Input label="Unidades" type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
            </div>
            <Input label="Descripción (opcional)" value={form.descripcion || ""} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.text }}>
              <input type="checkbox" checked={!!form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))} /> Operativa (desmarca para mantenimiento)
            </label>
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>La foto se sube desde la tarjeta de la máquina, con el botón <i className="ti ti-camera" />.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Guardar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
