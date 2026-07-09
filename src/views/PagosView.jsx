import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Row, Card, Badge, Btn, Input, Select, FilterSelect, FilterInput, Alert, Spinner, EmptyState, Modal, PageHeader, Avatar } from "../components";
import api from "../services/api";

const metodoLabel = { efectivo: "Efectivo", transferencia: "Transferencia", yape: "Yape", plin: "Plin" };
const estadoBadge = { pagado: "success", pendiente: "warning", vencido: "danger" };

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

  const [abono, setAbono] = useState(null); // pago a completar | null
  const [abonoForm, setAbonoForm] = useState({ monto: "", metodo_pago: "efectivo" });
  const [abonoSaving, setAbonoSaving] = useState(false);
  const [abonoError, setAbonoError] = useState("");

  useEffect(() => {
    api.get("/api/clientes?per_page=100&page=1")
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

  const openAbono = (p) => {
    setAbono(p);
    setAbonoForm({ monto: String(p.saldo_pendiente), metodo_pago: p.metodo_pago || "efectivo" });
    setAbonoError("");
  };

  const saveAbono = async (e) => {
    e.preventDefault();
    setAbonoSaving(true); setAbonoError("");
    try {
      await api.post(`/api/pagos/${abono.id}/abono`, {
        monto: parseFloat(abonoForm.monto),
        metodo_pago: abonoForm.metodo_pago,
      });
      setAbono(null);
      loadPagos();
      loadDeudas();
    } catch (err) { setAbonoError(err.message); }
    setAbonoSaving(false);
  };

  return (
    <div>
      <PageHeader
        icon="cash"
        title="Pagos"
        subtitle={`${pageInfo.total} pagos registrados`}
        actions={
          <Btn variant="primary" onClick={() => {
            setForm({ cliente_id: "", membresia_id: "", monto_total: "", monto_pagado: "", metodo_pago: "efectivo" });
            setError(""); setSuccess(""); setModal(true);
          }}>
            <i className="ti ti-plus" /> Registrar pago
          </Btn>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <FilterSelect value={filters.estado} onChange={e => updateFilter("estado", e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </FilterSelect>
            <FilterSelect value={filters.metodo_pago} onChange={e => updateFilter("metodo_pago", e.target.value)}>
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </FilterSelect>
            <FilterInput type="date" value={filters.fecha_desde} onChange={e => updateFilter("fecha_desde", e.target.value)} />
            <FilterInput type="date" value={filters.fecha_hasta} onChange={e => updateFilter("fecha_hasta", e.target.value)} />
          </div>

          {loading ? <Spinner /> : pagos.length === 0 ? <EmptyState icon="cash" text="No se encontraron pagos" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pagos.map(p => {
                const nombre = getNombreCliente(p.cliente_id);
                return (
                  <Row key={p.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar>{nombre.slice(0, 2).toUpperCase()}</Avatar>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{nombre}</span>
                          <Badge type="neutral">{metodoLabel[p.metodo_pago] || p.metodo_pago}</Badge>
                          <Badge type={estadoBadge[p.estado] || "neutral"}>{p.estado}</Badge>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                          {p.fecha_pago} · S/. {p.monto_pagado} / {p.monto_total}
                          {Number(p.saldo_pendiente) > 0 && <span style={{ color: C.dangerText }}> · Saldo: S/. {p.saldo_pendiente}</span>}
                        </p>
                      </div>
                    </div>
                    {Number(p.saldo_pendiente) > 0 && (
                      <Btn variant="success" onClick={() => openAbono(p)}><i className="ti ti-cash" /> Completar</Btn>
                    )}
                  </Row>
                );
              })}
            </div>
          )}

          {pageInfo.total_pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
              <Btn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Btn>
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "6px 14px", color: "#111",
                background: "#FFD600", borderRadius: 8, fontFamily: "'Barlow Condensed', sans-serif",
              }}>Página {page} de {pageInfo.total_pages}</span>
              <Btn disabled={page >= pageInfo.total_pages} onClick={() => setPage(p => p + 1)}>Siguiente</Btn>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <i className="ti ti-alert-triangle" style={{ marginRight: 6, color: C.dangerText }} />
            Clientes con deuda
          </h3>
          {loadingDeudas ? <Spinner /> : deudas.length === 0 ? <EmptyState icon="circle-check" text="No hay clientes con deuda" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {deudas.map(d => (
                <Card key={d.cliente_id} style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #ef5350" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.nombre_cliente}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.dangerText, marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>S/. {d.total_deuda}</div>
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

      {abono && (
        <Modal title="Completar pago" onClose={() => setAbono(null)} width={420}>
          <form onSubmit={saveAbono} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ background: C.bgSec, border: "none" }}>
              <div style={{ fontSize: 13, color: C.textSec }}>{getNombreCliente(abono.cliente_id)}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Total: S/. {abono.monto_total} · Pagado: S/. {abono.monto_pagado}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.dangerText, marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>
                Saldo pendiente: S/. {abono.saldo_pendiente}
              </div>
            </Card>
            <Input label="Monto a abonar (S/.)" type="number" step="0.01" min="0.01" max={abono.saldo_pendiente}
              value={abonoForm.monto} onChange={e => setAbonoForm(f => ({ ...f, monto: e.target.value }))} required />
            <Select label="Método de pago" value={abonoForm.metodo_pago} onChange={e => setAbonoForm(f => ({ ...f, metodo_pago: e.target.value }))}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </Select>
            {abonoError && <Alert>{abonoError}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setAbono(null)}>Cancelar</Btn>
              <Btn type="submit" variant="success" loading={abonoSaving}>Registrar abono</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
