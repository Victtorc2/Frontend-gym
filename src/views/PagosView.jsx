import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Input, Select, Alert, Spinner, EmptyState, Modal } from "../components";
import api from "../services/api";

const metodoLabel = { efectivo: "Efectivo", transferencia: "Transferencia", yape: "Yape", plin: "Plin" };
const estadoBadge = { pagado: "success", pendiente: "warning", vencido: "danger" };

const selectStyle = { padding: "7px 10px", borderRadius: 8, border: `0.5px solid ${C.borderSec}`, background: C.bg, color: C.text, fontSize: 13 };
const labelStyle = { fontSize: 13, fontWeight: 500, color: C.text };
const selectModalStyle = (value) => ({ padding: "9px 10px", borderRadius: 8, border: `0.5px solid ${C.borderSec}`, background: C.bg, color: value ? C.text : C.textSec, fontSize: 13 });

export default function PagosView() {
  const [pagos, setPagos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeudas, setLoadingDeudas] = useState(true);

  const [filters, setFilters] = useState({ estado: "", metodo_pago: "", fecha_desde: "", fecha_hasta: "" });
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, total_pages: 1 });

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ cliente_id: "", membresia_id: "", monto_total: "", monto_pagado: "", metodo_pago: "efectivo" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/api/clientes?per_page=200&page=1")
      .then(res => {
        const lista = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : null) || (Array.isArray(res) ? res : []);
        setClientes(lista);
      }).catch(() => {});
    api.get("/api/membresias?per_page=200&page=1")
      .then(res => {
        const lista = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : null) || (Array.isArray(res) ? res : []);
        setMembresias(lista);
      }).catch(() => {});
  }, []);

  const getNombreCliente = (cliente_id) => {
    const c = clientes.find(cl => String(cl.id) === String(cliente_id));
    return c ? `${c.nombres} ${c.apellidos}` : `Cliente #${cliente_id}`;
  };

  const loadDeudas = useCallback(async () => {
    setLoadingDeudas(true);
    try {
      const res = await api.get("/api/pagos/deudas");
      setDeudas(res.data || []);
    } catch {
      setDeudas([]);
    }
    setLoadingDeudas(false);
  }, []);

  const loadPagos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (filters.estado) params.set("estado", filters.estado);
      if (filters.metodo_pago) params.set("metodo_pago", filters.metodo_pago);
      if (filters.fecha_desde) params.set("fecha_desde", filters.fecha_desde);
      if (filters.fecha_hasta) params.set("fecha_hasta", filters.fecha_hasta);
      const res = await api.get(`/api/pagos?${params.toString()}`);
      const data = res.data || {};
      setPagos(data.items || []);
      setPageInfo({ total: data.total ?? 0, total_pages: data.total_pages ?? 1 });
    } catch {
      setPagos([]);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { loadDeudas(); }, [loadDeudas]);
  useEffect(() => { loadPagos(); }, [loadPagos]);

  const membresiasCliente = membresias.filter(m => String(m.cliente_id) === String(form.cliente_id));

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters(f => ({ ...f, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/pagos", {
        cliente_id: parseInt(form.cliente_id),
        membresia_id: parseInt(form.membresia_id),
        monto_total: parseFloat(form.monto_total),
        monto_pagado: parseFloat(form.monto_pagado),
        metodo_pago: form.metodo_pago,
      });
      setSuccess("Pago registrado correctamente");
      loadPagos();
      loadDeudas();
      setTimeout(() => setModal(false), 1200);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Pagos</h2>
        <Btn variant="primary" onClick={() => {
          setForm({ cliente_id: "", membresia_id: "", monto_total: "", monto_pagado: "", metodo_pago: "efectivo" });
          setError(""); setSuccess(""); setModal(true);
        }}>
          <i className="ti ti-plus" /> Registrar pago
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <select value={filters.estado} onChange={e => updateFilter("estado", e.target.value)} style={selectStyle}>
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
            <select value={filters.metodo_pago} onChange={e => updateFilter("metodo_pago", e.target.value)} style={selectStyle}>
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
            <input type="date" value={filters.fecha_desde} onChange={e => updateFilter("fecha_desde", e.target.value)} style={selectStyle} />
            <input type="date" value={filters.fecha_hasta} onChange={e => updateFilter("fecha_hasta", e.target.value)} style={selectStyle} />
          </div>

          {loading ? <Spinner /> : pagos.length === 0 ? <EmptyState icon="cash" text="No se encontraron pagos" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pagos.map(p => (
                <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{getNombreCliente(p.cliente_id)}</span>
                      <Badge type="neutral">{metodoLabel[p.metodo_pago] || p.metodo_pago}</Badge>
                      <Badge type={estadoBadge[p.estado] || "neutral"}>{p.estado}</Badge>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                      {p.fecha_pago} · S/. {p.monto_pagado} / {p.monto_total}
                      {Number(p.saldo_pendiente) > 0 && <span style={{ color: C.dangerText }}> · Saldo: S/. {p.saldo_pendiente}</span>}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {pageInfo.total_pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
              <Btn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Btn>
              <span style={{ fontSize: 13, color: C.textSec }}>Página {page} de {pageInfo.total_pages}</span>
              <Btn disabled={page >= pageInfo.total_pages} onClick={() => setPage(p => p + 1)}>Siguiente</Btn>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: C.text }}>Clientes con deuda</h3>
          {loadingDeudas ? <Spinner /> : deudas.length === 0 ? <EmptyState icon="circle-check" text="No hay clientes con deuda" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {deudas.map(d => (
                <Card key={d.cliente_id} style={{ padding: "0.85rem 1rem" }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{d.nombre_cliente}</div>
                  <div style={{ fontSize: 12, color: C.dangerText, marginTop: 2 }}>Deuda: S/. {d.total_deuda}</div>
                  <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>
                    {d.pagos_pendientes} pago(s) pendiente(s){d.ultimo_pago ? ` · Último: ${d.ultimo_pago}` : ""}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Registrar pago" onClose={() => setModal(false)}>
          <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Cliente</label>
              <select
                value={form.cliente_id}
                onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value, membresia_id: "" }))}
                required
                style={selectModalStyle(form.cliente_id)}
              >
                <option value="" disabled>Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} {c.dni ? `· ${c.dni}` : ""}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={labelStyle}>Membresía</label>
              <select
                value={form.membresia_id}
                onChange={e => setForm(f => ({ ...f, membresia_id: e.target.value }))}
                required
                disabled={!form.cliente_id}
                style={selectModalStyle(form.membresia_id)}
              >
                <option value="" disabled>Seleccionar membresía...</option>
                {membresiasCliente.map(m => (
                  <option key={m.id} value={m.id}>#{m.id} · {m.tipo} · {m.fecha_inicio} → {m.fecha_fin} · S/. {m.precio}</option>
                ))}
              </select>
            </div>

            <Input label="Monto total (S/.)" type="number" step="0.01" value={form.monto_total} onChange={e => setForm(f => ({ ...f, monto_total: e.target.value }))} required placeholder="Ej: 80.00" />
            <Input label="Monto pagado (S/.)" type="number" step="0.01" value={form.monto_pagado} onChange={e => setForm(f => ({ ...f, monto_pagado: e.target.value }))} required placeholder="Ej: 80.00" />

            <Select label="Método de pago" value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </Select>

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
