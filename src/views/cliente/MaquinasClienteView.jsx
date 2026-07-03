import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState, PageHeader, FilterSelect } from "../../components";
import api, { mediaUrl } from "../../services/api";

const ZONAS = ["pecho", "espalda", "piernas", "gluteos", "biceps", "triceps", "hombros", "abdomen", "cardio"];

export default function MaquinasClienteView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zona, setZona] = useState("");

  useEffect(() => {
    (async () => {
      try { setItems((await api.get("/api/maquinas/catalogo")).data || []); } catch { setItems([]); }
      setLoading(false);
    })();
  }, []);

  const visibles = zona ? items.filter(m => m.zona === zona) : items;

  return (
    <div>
      <PageHeader icon="barbell" title="Máquinas del gimnasio" subtitle="Conoce los equipos disponibles"
        actions={
          <FilterSelect value={zona} onChange={e => setZona(e.target.value)}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </FilterSelect>
        } />

      {loading ? <Spinner /> : visibles.length === 0 ? <EmptyState icon="barbell" text="No hay máquinas disponibles" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {visibles.map(m => (
            <Card key={m.id} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 160, background: C.bgSec, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m.foto_url
                  ? <img src={mediaUrl(m.foto_url)} alt={m.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <i className="ti ti-photo" style={{ fontSize: 40, color: C.textSec, opacity: 0.5 }} />}
              </div>
              <div style={{ padding: "0.85rem 1rem" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{m.nombre}</p>
                {m.descripcion && <p style={{ margin: "3px 0 6px", fontSize: 12, color: C.textSec }}>{m.descripcion}</p>}
                <Badge type="info">{m.zona}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
