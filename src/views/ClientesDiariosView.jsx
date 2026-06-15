import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Btn, Input, Alert, Spinner, EmptyState, Modal, StatusBadge } from "../components";
import api from "../services/api";

export default function ClientesDiariosView() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [pagoModal, setPagoModal] = useState(null);
  const [form, setForm] = useState({ nombre: "", documento: "" });
  const [pagoForm, setPagoForm] = useState({ monto: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/clientes-diarios");
      setClients(res.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveClient = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      // El backend solo acepta nombre y documento (documento opcional)
      const payload = { nombre: form.nombre };
      if (form.documento?.trim()) payload.documento = form.documento.trim();
      await api.post("/api/clientes-diarios", payload);
      setSuccess("Cliente diario registrado");
      load();
      setTimeout(() => setModal(false), 1500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const registerPago = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post(`/api/clientes-diarios/${pagoModal.id}/pago`, {
        monto: parseFloat(pagoForm.monto),
      });
      setSuccess("Pago registrado");
      load();
      setTimeout(() => setPagoModal(null), 1500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Clientes diarios</h2>
        <Btn variant="primary" onClick={() => { setForm({ nombre: "", documento: "" }); setError(""); setSuccess(""); setModal(true); }}>
          <i className="ti ti-plus" /> Nuevo cliente diario
        </Btn>
      </div>

      {loading ? <Spinner /> : clients.length === 0 ? <EmptyState icon="user-dollar" text="Sin clientes diarios registrados" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clients.map(c => (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{c.nombre}</span>
                  <StatusBadge estado={c.estado} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.textSec }}>
                  {c.documento ? `Doc: ${c.documento}` : "Sin documento"}
                </p>
              </div>
              {c.pago_hoy ? (
                <Btn disabled style={{ background: C.success, color: C.successText, border: "none" }}>
                  <i className="ti ti-check" /> Cliente ya pagó
                </Btn>
              ) : (
                <Btn variant="primary" onClick={() => { setPagoForm({ monto: "" }); setError(""); setSuccess(""); setPagoModal(c); }}>
                  <i className="ti ti-cash" /> Registrar pago
                </Btn>
              )}
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Registrar cliente diario" onClose={() => setModal(false)}>
          <form onSubmit={saveClient} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
            <Input label="Documento (opcional)" value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} />
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Guardar</Btn>
            </div>
          </form>
        </Modal>
      )}

      {pagoModal && (
        <Modal title={`Registrar pago – ${pagoModal.nombre}`} onClose={() => setPagoModal(null)}>
          <form onSubmit={registerPago} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Monto (S/.)" type="number" step="0.01" value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} required placeholder="Ej: 5.00" />
            {error && <Alert>{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setPagoModal(null)}>Cancelar</Btn>
              <Btn type="submit" variant="primary" loading={saving}>Registrar pago</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
