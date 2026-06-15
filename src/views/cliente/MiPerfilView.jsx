import { useState, useEffect } from "react";
import { C } from "../../styles/colors";
import { Card, Badge, Spinner, EmptyState, StatusBadge } from "../../components";
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
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mi Perfil</h2>
      </div>

      <Card style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD600, #FF9900)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <i className="ti ti-user" style={{ fontSize: 30, color: "#111" }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {perfil.nombres} {perfil.apellidos}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <StatusBadge estado={perfil.estado} />
              <Badge type="neutral">{perfil.grupo_edad}</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="DNI" value={perfil.dni} />
          <Field label="Edad" value={`${perfil.edad} años`} />
          <Field label="Correo" value={perfil.correo} />
          <Field label="Teléfono" value={perfil.telefono} />
          <Field label="Sexo" value={perfil.sexo} />
          <Field label="Ocupación" value={perfil.ocupacion || "—"} />
          <Field label="Dirección" value={perfil.direccion || "—"} />
          <Field label="Miembro desde" value={miembroDesde} />
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
