import Layout from "./components/Layout";
import api from "./services/api";
import MiPerfilView from "./views/cliente/MiPerfilView";
import MiMembresiaView from "./views/cliente/MiMembresiaView";
import MisPagosView from "./views/cliente/MisPagosView";
import MiAsistenciaView from "./views/cliente/MiAsistenciaView";
import MiHorarioRecomendadoView from "./views/cliente/MiHorarioRecomendadoView";

const NAV = [
  { id: "perfil",     icon: "user",        label: "Mi Perfil" },
  { id: "membresia",  icon: "id-badge",    label: "Mi Membresía" },
  { id: "pagos",      icon: "cash",        label: "Mis Pagos" },
  { id: "asistencia", icon: "activity",    label: "Mi Asistencia" },
  { id: "horario",    icon: "clock-bolt",  label: "Horario Recomendado" },
];

const VIEWS = {
  perfil:     <MiPerfilView />,
  membresia:  <MiMembresiaView />,
  pagos:      <MisPagosView />,
  asistencia: <MiAsistenciaView />,
  horario:    <MiHorarioRecomendadoView />,
};

export default function ClientApp({ auth, logout }) {
  const handleLogout = async () => {
    try { await api.post("/api/cliente/logout"); } catch { /* sesión ya inválida */ }
    logout();
  };

  return <Layout nav={NAV} views={VIEWS} auth={auth} logout={handleLogout} />;
}
