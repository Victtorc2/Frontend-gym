import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState, StatusBadge } from "../../components";
import api from "../../services/api";

const tipoColor = { mensual: "info", anual: "success", diario: "warning" };

export default function MiMembresiaView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/cliente/mi-membresia")
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="id-badge" text={error} />;

  if (!data || data.tiene_membresia === false) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mi Membresía</h2>
        </div>
        <EmptyState icon="id-badge" text={data?.mensaje || "No tienes una membresía activa en este momento"} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mi Membresía</h2>
      </div>

      <Card style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Badge type={tipoColor[data.tipo] || "neutral"}>{data.tipo}</Badge>
          <StatusBadge estado={data.estado} />
          {data.vigente && <Badge type="success">Vigente</Badge>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Precio" value={`S/. ${data.precio}`} />
          <Field label="Días restantes" value={data.dias_restantes} />
          <Field label="Fecha de inicio" value={data.fecha_inicio} />
          <Field label="Fecha de fin" value={data.fecha_fin} />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: C.text }}>{value}</div>
    </div>
  );
}
