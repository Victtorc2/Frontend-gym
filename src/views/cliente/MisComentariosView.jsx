import { useState, useEffect, useCallback } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Btn, Alert, Spinner, EmptyState, PageHeader } from "../../components";
import api from "../../services/api";

const TIPOS = ["comentario", "sugerencia", "recomendacion", "queja"];
const TIPO_BADGE = { comentario: "info", sugerencia: "success", recomendacion: "info", queja: "danger" };
const ESTADO_BADGE = { nuevo: "info", leido: "success", archivado: "neutral" };
const fieldInput = { padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.borderSec}`, background: C.bgSec, color: C.text, fontSize: 14 };

export default function MisComentariosView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tipo: "sugerencia", asunto: "", mensaje: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await api.get("/api/mis-comentarios")).data || []); } catch { setItems([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setOk("");
    try {
      await api.post("/api/mis-comentarios", { ...form, asunto: form.asunto || null });
      setOk("¡Gracias por tu opinión!");
      setForm({ tipo: "sugerencia", asunto: "", mensaje: "" });
      load();
      setTimeout(() => setOk(""), 2500);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const remove = async (c) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    try { await api.del(`/api/mis-comentarios/${c.id}`); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="message-2" title="Comentarios y sugerencias" subtitle="Cuéntanos qué mejorar en el gimnasio" />

      <Card style={{ marginBottom: 16 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: C.textSec }}>Tipo<br />
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={{ ...fieldInput, marginTop: 4, textTransform: "capitalize" }}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: C.textSec, flex: 1, minWidth: 200 }}>Asunto (opcional)<br />
              <input value={form.asunto} onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))} maxLength={150} style={{ ...fieldInput, width: "100%", marginTop: 4 }} />
            </label>
          </div>
          <textarea placeholder="Escribe tu mensaje..." value={form.mensaje} required maxLength={2000}
            onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
            style={{ ...fieldInput, fontFamily: "inherit", minHeight: 90, resize: "vertical" }} />
          {error && <Alert>{error}</Alert>}
          {ok && <Alert type="success">{ok}</Alert>}
          <div><Btn type="submit" variant="primary" loading={saving}><i className="ti ti-send" /> Enviar</Btn></div>
        </form>
      </Card>

      <h3 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'Barlow Condensed', sans-serif" }}>Mis mensajes enviados</h3>
      {loading ? <Spinner /> : items.length === 0 ? <EmptyState icon="message-2" text="Aún no has enviado mensajes" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(c => (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                  <Badge type={TIPO_BADGE[c.tipo]}>{c.tipo}</Badge>
                  {c.asunto && <span style={{ fontWeight: 600, fontSize: 14 }}>{c.asunto}</span>}
                  <Badge type={ESTADO_BADGE[c.estado]}>{c.estado}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.text, whiteSpace: "pre-wrap" }}>{c.mensaje}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textSec }}>{c.created_at?.slice(0, 16).replace("T", " ")}</p>
              </div>
              <Btn variant="danger" onClick={() => remove(c)}><i className="ti ti-trash" /></Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
