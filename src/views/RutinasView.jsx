import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Input, Alert, Spinner, EmptyState, Modal, PageHeader } from "../components";
import api from "../services/api";

export default function RutinasView() {
  const [items, setItems] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", maquina_ids: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        api.get("/api/rutinas?per_page=200"),
        api.get("/api/maquinas?per_page=200&solo_activas=true"),
      ]);
      setItems(r.data.items || []);
      setMachines(m.data.items || []);
    } catch { setItems([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ nombre: "", descripcion: "", maquina_ids: [] }); setError(""); setSuccess(""); setModal("create"); };
  const openEdit = (r) => { setForm({ nombre: r.nombre, descripcion: r.descripcion || "", maquina_ids: r.maquinas.map(x => x.maquina_id) }); setError(""); setSuccess(""); setModal(r); };
  const toggleMachine = (id) => setForm(f => ({ ...f, maquina_ids: f.maquina_ids.includes(id) ? f.maquina_ids.filter(x => x !== id) : [...f.maquina_ids, id] }));

  const save = async (e) => {
    e.preventDefault();
    if (form.maquina_ids.length === 0) { setError("Selecciona al menos una máquina"); return; }
    setSaving(true); setError("");
    try {
      if (modal === "create") await api.post("/api/rutinas", form);
      else await api.put(`/api/rutinas/${modal.id}`, form);
      setSuccess("Guardado correctamente");
      load();
      setTimeout(() => setModal(null), 900);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const remove = async (r) => {
    if (!confirm(`¿Eliminar la rutina "${r.nombre}"?`)) return;
    try { await api.del(`/api/rutinas/${r.id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="clipboard-list" title="Rutinas" subtitle="Plantillas de entrenamiento con sus máquinas"
        actions={<Btn variant="primary" onClick={openCreate}><i className="ti ti-plus" /> Nueva rutina</Btn>} />

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState icon="clipboard-list" text="No hay rutinas" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {items.map(r => (
            <Card key={r.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{r.nombre}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSec }}>{r.descripcion || "—"}</p>
                </div>
                <Badge type={r.activa ? "success" : "neutral"}>{r.activa ? "activa" : "inactiva"}</Badge>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {r.zonas.map(z => <Badge key={z} type="info">{z}</Badge>)}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: C.textSec }}><i className="ti ti-barbell" /> {r.maquinas.map(m => m.nombre).join(", ")}</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <Btn onClick={() => openEdit(r)}><i className="ti ti-edit" /> Editar</Btn>
                <Btn variant="danger" onClick={() => remove(r)}><i className="ti ti-trash" /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "create" ? "Nueva rutina" : `Editar: ${modal.nombre}`} onClose={() => setModal(null)} width={560}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
            <Input label="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            <div>
              <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                Máquinas ({form.maquina_ids.length})
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, maxHeight: 220, overflow: "auto" }}>
                {machines.map(m => {
                  const on = form.maquina_ids.includes(m.id);
                  return (
                    <button type="button" key={m.id} onClick={() => toggleMachine(m.id)}
                      style={{ padding: "6px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                        border: on ? "1.5px solid #FFD600" : `1.5px solid ${C.borderSec}`,
                        background: on ? "rgba(255,214,0,0.15)" : C.bgSec, color: C.text, fontWeight: on ? 700 : 500 }}>
                      {on && <i className="ti ti-check" style={{ marginRight: 4 }} />}{m.nombre}
                      <span style={{ color: C.textSec, marginLeft: 5, fontSize: 10 }}>{m.zona}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Guardar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
