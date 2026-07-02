import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Input, Select, Alert, Spinner, EmptyState, Modal, PageHeader, FilterInput, FilterSelect } from "../components";
import api from "../services/api";

const ZONAS = ["pecho", "espalda", "piernas", "gluteos", "biceps", "triceps", "hombros", "abdomen", "cardio"];

export default function MaquinasView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [zona, setZona] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | machine
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "200" });
      if (buscar) params.set("buscar", buscar);
      if (zona) params.set("zona", zona);
      const res = await api.get(`/api/maquinas?${params}`);
      setItems(res.data.items || []);
    } catch { setItems([]); }
    setLoading(false);
  }, [buscar, zona]);

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

  const remove = async (m) => {
    if (!confirm(`¿Eliminar la máquina "${m.nombre}"?`)) return;
    try { await api.del(`/api/maquinas/${m.id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="barbell" title="Máquinas" subtitle="Catálogo de equipos por zona muscular"
        actions={<>
          <FilterInput placeholder="Buscar..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ width: 150 }} />
          <FilterSelect value={zona} onChange={e => setZona(e.target.value)}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </FilterSelect>
          <Btn variant="primary" onClick={openCreate}><i className="ti ti-plus" /> Nueva</Btn>
        </>}
      />

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState icon="barbell" text="No hay máquinas" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {items.map(m => (
            <Card key={m.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{m.nombre}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSec }}>{m.descripcion || "—"}</p>
                </div>
                <Badge type={m.activa ? "success" : "neutral"}>{m.activa ? "activa" : "inactiva"}</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge type="info">{m.zona}</Badge>
                <span style={{ fontSize: 13, color: C.textSec }}><i className="ti ti-stack-2" /> {m.cantidad} unid.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <Btn onClick={() => openEdit(m)}><i className="ti ti-edit" /> Editar</Btn>
                <Btn variant="danger" onClick={() => remove(m)}><i className="ti ti-trash" /></Btn>
              </div>
            </Card>
          ))}
        </div>
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
              <input type="checkbox" checked={!!form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))} /> Activa
            </label>
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
