import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Row, Badge, Btn, Input, Select, FilterSelect, Alert, Spinner, EmptyState, Modal, StatusBadge, PageHeader, Avatar } from "../components";
import api from "../services/api";

const tipoColor = { mensual: "info", anual: "success", diario: "warning" };

export default function MembresiasView() {
  const [mems, setMems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id: "", tipo: "mensual", precio: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEstado, setFilterEstado] = useState("activa");

  // Cargar lista de clientes para mostrar nombres
  useEffect(() => {
    api.get("/api/clientes?per_page=100&page=1")
      .then(res => {
        // El API puede devolver distintas estructuras
        const lista =
          res?.data?.items ||   // { data: { items: [...] } }
          res?.items ||          // { items: [...] }
          (Array.isArray(res?.data) ? res.data : null) || // { data: [...] }
          (Array.isArray(res) ? res : []);                // [...]
        setClientes(lista);
      })
      .catch(() => {});
  }, []);

  const getNombreCliente = (cliente_id) => {
    const c = clientes.find(cl => String(cl.id) === String(cliente_id));
    return c ? `${c.nombres} ${c.apellidos}` : `Cliente #${cliente_id}`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = "/api/membresias";
      const params = [];
      if (filterTipo) params.push(`tipo=${filterTipo}`);
      if (filterEstado) params.push(`estado=${filterEstado}`);
      if (params.length) q += "?" + params.join("&");
      const res = await api.get(q);
      setMems(res.data || []);
    } catch {}
    setLoading(false);
  }, [filterTipo, filterEstado]);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/membresias", { ...form, cliente_id: parseInt(form.cliente_id), precio: parseFloat(form.precio) });
      setSuccess("Membresía registrada correctamente");
      load();
      setTimeout(() => setModal(false), 1500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader
        icon="id-badge"
        title="Membresías"
        subtitle={`${mems.length} membresías encontradas`}
        actions={
          <>
            <FilterSelect value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
              <option value="diario">Diario</option>
            </FilterSelect>
            <FilterSelect value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="vencida">Vencida</option>
              <option value="pendiente">Pendiente</option>
            </FilterSelect>
            <Btn variant="primary" onClick={() => { setForm({ cliente_id: "", tipo: "mensual", precio: "" }); setError(""); setSuccess(""); setModal(true); }}>
              <i className="ti ti-plus" /> Nueva membresía
            </Btn>
          </>
        }
      />

      {loading ? <Spinner /> : mems.length === 0 ? <EmptyState icon="id-badge" text="No se encontraron membresías" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mems.map(m => {
            const nombre = getNombreCliente(m.cliente_id);
            return (
              <Row key={m.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar>{nombre.slice(0, 2).toUpperCase()}</Avatar>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{nombre}</span>
                      <Badge type={tipoColor[m.tipo] || "neutral"}>{m.tipo}</Badge>
                      <StatusBadge estado={m.estado} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                      {m.fecha_inicio} → {m.fecha_fin} · S/. {m.precio}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => api.get(`/api/tarjetas/cliente/${m.cliente_id}`).then(r => alert(JSON.stringify(r.data, null, 2))).catch(err => alert(err.message))}>
                    <i className="ti ti-credit-card" /> Tarjetas
                  </Btn>
                </div>
              </Row>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Registrar membresía" onClose={() => setModal(false)}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Cliente</label>
              <select
                value={form.cliente_id}
                onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                required
                style={{ padding: "9px 10px", borderRadius: 8, border: `0.5px solid ${C.borderSec}`, background: C.bg, color: form.cliente_id ? C.text : C.textSec, fontSize: 13 }}
              >
                <option value="" disabled>Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombres} {c.apellidos} {c.dni ? `· ${c.dni}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Select label="Tipo de membresía" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="mensual">Mensual (30 días)</option>
              <option value="anual">Anual (365 días)</option>
              <option value="diario">Diario (1 día)</option>
            </Select>
            <Input label="Precio (S/.)" type="number" step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} required placeholder="Ej: 80.00" />
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Registrar</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
