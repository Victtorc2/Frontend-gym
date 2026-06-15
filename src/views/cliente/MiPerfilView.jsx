import { useState, useEffect } from "react";
import { Card, Badge, Spinner, EmptyState, StatusBadge, PageHeader, DetailField, Avatar } from "../../components";
import api from "../../services/api";

export default function MiPerfilView() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/cliente/mi-perfil")
      .then(res => setPerfil(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="user-exclamation" text={error} />;
  if (!perfil) return null;

  const miembroDesde = new Date(perfil.miembro_desde).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader icon="user" title="Mi perfil" subtitle="Información personal de tu cuenta" />

      <Card style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <Avatar size={64}>{(perfil.nombres[0] + perfil.apellidos[0]).toUpperCase()}</Avatar>
          <div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              fontFamily: "'Barlow Condensed', sans-serif",
              textTransform: "uppercase", letterSpacing: "0.02em",
            }}>
              {perfil.nombres} {perfil.apellidos}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <StatusBadge estado={perfil.estado} />
              <Badge type="neutral">{perfil.grupo_edad}</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <DetailField label="DNI" value={perfil.dni} />
          <DetailField label="Edad" value={`${perfil.edad} años`} />
          <DetailField label="Correo" value={perfil.correo} />
          <DetailField label="Teléfono" value={perfil.telefono} />
          <DetailField label="Sexo" value={perfil.sexo} />
          <DetailField label="Ocupación" value={perfil.ocupacion || "—"} />
          <DetailField label="Dirección" value={perfil.direccion || "—"} />
          <DetailField label="Miembro desde" value={miembroDesde} />
        </div>
      </Card>
    </div>
  );
}
