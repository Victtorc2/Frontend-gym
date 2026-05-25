import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Input, Select, Alert, Spinner, EmptyState, Modal, StatusBadge } from "../components";
import api from "../services/api";

export default function ClientesView() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | client-object
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = search
        ? `/api/clientes/busqueda?nombre=${encodeURIComponent(search)}&per_page=20&page=${page}`
        : `/api/clientes?per_page=20&page=${page}`;
      const res = await api.get(q);
      setClients(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ nombres: "", apellidos: "", dni: "", telefono: "", correo: "", sexo: "masculino", fecha_nacimiento: "", ocupacion: "", direccion: "" });
    setError(""); setSuccess("");
    setModal("create");
  };

  const openEdit = (c) => {
    setForm({ nombres: c.nombres, apellidos: c.apellidos, telefono: c.telefono, correo: c.correo, sexo: c.sexo, fecha_nacimiento: c.fecha_nacimiento, ocupacion: c.ocupacion || "", direccion: c.direccion || "" });
    setError(""); setSuccess("");
    setModal(c);
  };

  const saveCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/api/clientes", form);
      setSuccess("Cliente registrado correctamente");
      load();
      setTimeout(() => setModal(null), 1500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.put(`/api/clientes/${modal.id}`, form);
      setSuccess("Cliente actualizado correctamente");
      load();
      setTimeout(() => setModal(null), 1500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const toggleStatus = async (c) => {
    const newStatus = c.estado === "activo" ? "inactivo" : "activo";
    try {
      await api.patch(`/api/clientes/${c.id}/estado`, { estado: newStatus });
      load();
    } catch (err) { alert(err.message); }
  };

  const ClientForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Nombres" value={form.nombres || ""} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} required />
        <Input label="Apellidos" value={form.apellidos || ""} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} required />
      </div>
      {modal === "create" && <Input label="DNI" value={form.dni || ""} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} required />}
      <Input label="Teléfono" value={form.telefono || ""} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} required />
      <Input label="Correo" type="email" value={form.correo || ""} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} required />
      <Select label="Sexo" value={form.sexo || "masculino"} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
        <option value="otro">Otro</option>
      </Select>
      <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento || ""} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} required />
      <Input label="Ocupación (opcional)" value={form.ocupacion || ""} onChange={e => setForm(f => ({ ...f, ocupacion: e.target.value }))} />
      <Input label="Dirección (opcional)" value={form.direccion || ""} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Btn onClick={() => setModal(null)}>Cancelar</Btn>
        <Btn type="submit" variant="primary" loading={saving}>Guardar</Btn>
      </div>
    </form>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Clientes</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: "7px 10px", borderRadius: 8, border: `0.5px solid ${C.borderSec}`, background: C.bg, color: C.text, fontSize: 13, width: 200 }}
          />
          <Btn variant="primary" onClick={openCreate}><i className="ti ti-plus" /> Nuevo cliente</Btn>
        </div>
      </div>

      {loading ? <Spinner /> : clients.length === 0 ? <EmptyState icon="users" text="No se encontraron clientes" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clients.map(c => (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.info, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: C.infoText, flexShrink: 0 }}>
                  {(c.nombres[0] + c.apellidos[0]).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{c.nombres} {c.apellidos}</p>
                  <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>DNI: {c.dni} · {c.correo}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge estado={c.estado} />
                <Badge type="neutral">{c.grupo_edad}</Badge>
                <Btn onClick={() => openEdit(c)}><i className="ti ti-edit" /> Editar</Btn>
                <Btn onClick={() => toggleStatus(c)} variant={c.estado === "activo" ? "danger" : "primary"}>
                  {c.estado === "activo" ? "Desactivar" : "Activar"}
                </Btn>
              </div>
            </Card>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>{total} clientes totales</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="ti ti-arrow-left" /></Btn>
              <span style={{ fontSize: 13, padding: "7px 0", color: C.textSec }}>Pág. {page}</span>
              <Btn disabled={clients.length < 20} onClick={() => setPage(p => p + 1)}><i className="ti ti-arrow-right" /></Btn>
            </div>
          </div>
        </div>
      )}

      {modal === "create" && (
        <Modal title="Registrar nuevo cliente" onClose={() => setModal(null)} width={520}>
          <ClientForm onSubmit={saveCreate} />
        </Modal>
      )}
      {modal && modal !== "create" && (
        <Modal title={`Editar: ${modal.nombres} ${modal.apellidos}`} onClose={() => setModal(null)} width={520}>
          <ClientForm onSubmit={saveEdit} />
        </Modal>
      )}
    </div>
  );
}
