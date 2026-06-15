import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState, StatusBadge, PageHeader, StatCard } from "../../components";
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
        <PageHeader icon="id-badge" title="Mi membresía" subtitle="Estado de tu membresía actual" />
        <EmptyState icon="id-badge" text={data?.mensaje || "No tienes una membresía activa en este momento"} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon="id-badge" title="Mi membresía" subtitle="Estado de tu membresía actual" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
        <StatCard icon="calendar-time" label="Días restantes" value={data.dias_restantes} color={data.dias_restantes <= 5 ? "#ef5350" : "#66bb6a"} />
        <StatCard icon="cash" label="Precio" value={`S/. ${data.precio}`} color="#FFD600" />
        <StatCard icon="calendar-event" label="Inicio" value={data.fecha_inicio} color="#42a5f5" />
        <StatCard icon="calendar-check" label="Fin" value={data.fecha_fin} color="#ab47bc" />
      </div>

      <Card style={{ maxWidth: 480 }}>
        <div style={{
          fontSize: 12, color: C.textSec, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
          marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          Tipo de membresía
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge type={tipoColor[data.tipo] || "neutral"}>{data.tipo}</Badge>
          <StatusBadge estado={data.estado} />
          {data.vigente && <Badge type="success">Vigente</Badge>}
        </div>
      </Card>
    </div>
  );
}
