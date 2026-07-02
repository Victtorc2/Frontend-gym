import { useState, useEffect, useCallback } from "react";
import { C } from "../styles/colors";
import { Card, Badge, Btn, Spinner, EmptyState, Modal, PageHeader, FilterSelect } from "../components";
import api from "../services/api";

const TIPO_BADGE = { comentario: "info", sugerencia: "success", recomendacion: "info", queja: "danger" };
const ESTADO_BADGE = { nuevo: "danger", leido: "info", archivado: "neutral" };
const TIPOS = ["comentario", "sugerencia", "recomendacion", "queja"];
const ESTADOS = ["nuevo", "leido", "archivado"];

export default function ComentariosView() {
  const [items, setItems] = useState([]);
  const [nuevos, setNuevos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "100" });
      if (tipo) params.set("tipo", tipo);
      if (estado) params.set("estado", estado);
      const res = await api.get(`/api/comentarios?${params}`);
      setItems(res.data.items || []);
      setNuevos(res.data.nuevos || 0);
    } catch { setItems([]); }
    setLoading(false);
  }, [tipo, estado]);
  useEffect(() => { load(); }, [load]);

  const open = async (c) => {
    try { const res = await api.get(`/api/comentarios/${c.id}`); setDetail(res.data); load(); }
    catch { setDetail(c); }
  };
  const cambiarEstado = async (nuevoEstado) => {
    try { const res = await api.patch(`/api/comentarios/${detail.id}/estado`, { estado: nuevoEstado }); setDetail(res.data); load(); }
    catch (err) { alert(err.message); }
  };
  const remove = async (c) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try { await api.del(`/api/comentarios/${c.id}`); setDetail(null); load(); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <PageHeader icon="message-2" title="Comentarios" subtitle={nuevos > 0 ? `${nuevos} sin leer` : "Opiniones de los clientes"}
        actions={<>
          <FilterSelect value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </FilterSelect>
          <FilterSelect value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </FilterSelect>
        </>} />

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState icon="message-2" text="No hay comentarios" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(c => (
            <Card key={c.id} className="row-card" onClick={() => open(c)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderLeft: c.estado === "nuevo" ? "3px solid #ef4444" : "3px solid transparent" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <Badge type={TIPO_BADGE[c.tipo]}>{c.tipo}</Badge>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{c.asunto || "(sin asunto)"}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.cliente_nombre} · {c.mensaje}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: C.textSec }}>{c.created_at?.slice(0, 10)}</span>
                <Badge type={ESTADO_BADGE[c.estado]}>{c.estado}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {detail && (
        <Modal title={detail.asunto || detail.tipo} onClose={() => setDetail(null)} width={520}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Badge type={TIPO_BADGE[detail.tipo]}>{detail.tipo}</Badge>
              <Badge type={ESTADO_BADGE[detail.estado]}>{detail.estado}</Badge>
              <span style={{ fontSize: 13, color: C.textSec }}>{detail.cliente_nombre} · {detail.created_at?.slice(0, 16).replace("T", " ")}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{detail.mensaje}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {detail.estado !== "leido" && <Btn onClick={() => cambiarEstado("leido")}>Marcar leído</Btn>}
                {detail.estado !== "archivado" && <Btn onClick={() => cambiarEstado("archivado")}><i className="ti ti-archive" /> Archivar</Btn>}
              </div>
              <Btn variant="danger" onClick={() => remove(detail)}><i className="ti ti-trash" /> Eliminar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
